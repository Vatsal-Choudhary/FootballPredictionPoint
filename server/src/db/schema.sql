-- ============================================================
-- World Cup Predictor — PostgreSQL Schema
-- Run: psql -d worldcup_predictor -f schema.sql
-- ============================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username            VARCHAR(50)  UNIQUE NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    password            VARCHAR(255) NOT NULL,              -- bcrypt hash
    avatar_url          TEXT,
    is_admin            BOOLEAN      NOT NULL DEFAULT FALSE,
    email_verified      BOOLEAN      NOT NULL DEFAULT FALSE,
    verification_token  VARCHAR(255),                       -- email verification token
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email              ON users(email);
CREATE INDEX idx_users_verification_token ON users(verification_token);

-- ============================================================
-- 2. GROUPS (private prediction leagues)
-- ============================================================
CREATE TABLE groups (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    invite_code VARCHAR(8)   UNIQUE NOT NULL,               -- short alphanumeric code
    created_by  UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_members INT          NOT NULL DEFAULT 50,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_groups_invite_code ON groups(invite_code);
CREATE INDEX idx_groups_created_by  ON groups(created_by);

-- ============================================================
-- 3. GROUP MEMBERS (many-to-many: users <-> groups)
-- ============================================================
CREATE TABLE group_members (
    group_id    UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

CREATE INDEX idx_group_members_user  ON group_members(user_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);

-- ============================================================
-- 4. TEAMS
-- ============================================================
CREATE TABLE teams (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(3)   NOT NULL UNIQUE,               -- FIFA code: 'BRA', 'GER', etc.
    flag_url    TEXT,
    group_name  VARCHAR(5)                                  -- 'A' through 'L'; NULL for TBD
);

CREATE INDEX idx_teams_code       ON teams(code);
CREATE INDEX idx_teams_group_name ON teams(group_name);

-- ============================================================
-- 5. MATCHES
-- ============================================================
CREATE TABLE matches (
    id              SERIAL PRIMARY KEY,
    external_id     INT UNIQUE,                             -- ID from WorldCup26 API (1-104)
    home_team_id    INT REFERENCES teams(id),               -- nullable for knockout TBD
    away_team_id    INT REFERENCES teams(id),               -- nullable for knockout TBD
    match_date      TIMESTAMPTZ NOT NULL,
    stage           VARCHAR(50) NOT NULL,                    -- 'Group A', 'Round of 32', 'Quarter-Final', 'Semi-Final', 'Final'
    venue           VARCHAR(200),
    lock_time       TIMESTAMPTZ NOT NULL,                    -- predictions lock before this (usually 1h before kickoff)
    home_score      INT,                                     -- NULL until result arrives
    away_score      INT,                                     -- NULL until result arrives
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
                    -- SCHEDULED | LIVE | FINISHED | POSTPONED
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_matches_status      ON matches(status);
CREATE INDEX idx_matches_date        ON matches(match_date);
CREATE INDEX idx_matches_external_id ON matches(external_id);
CREATE INDEX idx_matches_stage       ON matches(stage);

-- ============================================================
-- 6. PREDICTIONS
-- ============================================================
CREATE TABLE predictions (
    id              SERIAL PRIMARY KEY,
    user_id         UUID    NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    match_id        INT     NOT NULL REFERENCES matches(id)  ON DELETE CASCADE,
    predicted_home  INT     NOT NULL CHECK (predicted_home >= 0),
    predicted_away  INT     NOT NULL CHECK (predicted_away >= 0),
    points_awarded  INT,                                     -- NULL until match is scored
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, match_id)                               -- one prediction per user per match
);

CREATE INDEX idx_predictions_user    ON predictions(user_id);
CREATE INDEX idx_predictions_match   ON predictions(match_id);
CREATE INDEX idx_predictions_points  ON predictions(points_awarded);

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_predictions_updated_at
    BEFORE UPDATE ON predictions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
