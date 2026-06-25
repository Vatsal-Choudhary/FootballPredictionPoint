-- ============================================================
-- World Cup Predictor — Seed Data (Real 2026 Data)
-- Source: WorldCup26 API (worldcup26.ir) — captured 2026-06-17
-- Run AFTER schema.sql: psql -d worldcup_predictor -f seed.sql
-- ============================================================

-- Wipe everything in FK-safe order
TRUNCATE predictions, group_members, groups, matches, teams RESTART IDENTITY CASCADE;

-- ============================================================
-- TEAMS — 48 qualified nations (exact from API /get/teams)
-- Ordered by API id (1-48) so DB serial id matches API team_id
-- ============================================================

INSERT INTO teams (name, code, flag_url, group_name) VALUES
-- Group A
('Mexico',                        'MEX', 'https://flagcdn.com/w80/mx.png',    'Group A'),
('South Africa',                  'RSA', 'https://flagcdn.com/w80/za.png',    'Group A'),
('South Korea',                   'KOR', 'https://flagcdn.com/w80/kr.png',    'Group A'),
('Czech Republic',                'CZE', 'https://flagcdn.com/w80/cz.png',    'Group A'),
-- Group B
('Canada',                        'CAN', 'https://flagcdn.com/w80/ca.png',    'Group B'),
('Bosnia and Herzegovina',        'BIH', 'https://flagcdn.com/w80/ba.png',    'Group B'),
('Qatar',                         'QAT', 'https://flagcdn.com/w80/qa.png',    'Group B'),
('Switzerland',                   'SUI', 'https://flagcdn.com/w80/ch.png',    'Group B'),
-- Group C
('Brazil',                        'BRA', 'https://flagcdn.com/w80/br.png',    'Group C'),
('Morocco',                       'MAR', 'https://flagcdn.com/w80/ma.png',    'Group C'),
('Haiti',                         'HAI', 'https://flagcdn.com/w80/ht.png',    'Group C'),
('Scotland',                      'SCO', 'https://flagcdn.com/w80/gb-sct.png','Group C'),
-- Group D
('United States',                 'USA', 'https://flagcdn.com/w80/us.png',    'Group D'),
('Paraguay',                      'PAR', 'https://flagcdn.com/w80/py.png',    'Group D'),
('Australia',                     'AUS', 'https://flagcdn.com/w80/au.png',    'Group D'),
('Turkey',                        'TUR', 'https://flagcdn.com/w80/tr.png',    'Group D'),
-- Group E
('Germany',                       'GER', 'https://flagcdn.com/w80/de.png',    'Group E'),
('Curacao',                       'CUW', 'https://flagcdn.com/w80/cw.png',    'Group E'),
('Ivory Coast',                   'CIV', 'https://flagcdn.com/w80/ci.png',    'Group E'),
('Ecuador',                       'ECU', 'https://flagcdn.com/w80/ec.png',    'Group E'),
-- Group F
('Netherlands',                   'NED', 'https://flagcdn.com/w80/nl.png',    'Group F'),
('Japan',                         'JPN', 'https://flagcdn.com/w80/jp.png',    'Group F'),
('Sweden',                        'SWE', 'https://flagcdn.com/w80/se.png',    'Group F'),
('Tunisia',                       'TUN', 'https://flagcdn.com/w80/tn.png',    'Group F'),
-- Group G
('Belgium',                       'BEL', 'https://flagcdn.com/w80/be.png',    'Group G'),
('Egypt',                         'EGY', 'https://flagcdn.com/w80/eg.png',    'Group G'),
('Iran',                          'IRN', 'https://flagcdn.com/w80/ir.png',    'Group G'),
('New Zealand',                   'NZL', 'https://flagcdn.com/w80/nz.png',    'Group G'),
-- Group H
('Spain',                         'ESP', 'https://flagcdn.com/w80/es.png',    'Group H'),
('Cape Verde',                    'CPV', 'https://flagcdn.com/w80/cv.png',    'Group H'),
('Saudi Arabia',                  'KSA', 'https://flagcdn.com/w80/sa.png',    'Group H'),
('Uruguay',                       'URU', 'https://flagcdn.com/w80/uy.png',    'Group H'),
-- Group I
('France',                        'FRA', 'https://flagcdn.com/w80/fr.png',    'Group I'),
('Senegal',                       'SEN', 'https://flagcdn.com/w80/sn.png',    'Group I'),
('Iraq',                          'IRQ', 'https://flagcdn.com/w80/iq.png',    'Group I'),
('Norway',                        'NOR', 'https://flagcdn.com/w80/no.png',    'Group I'),
-- Group J
('Argentina',                     'ARG', 'https://flagcdn.com/w80/ar.png',    'Group J'),
('Algeria',                       'ALG', 'https://flagcdn.com/w80/dz.png',    'Group J'),
('Austria',                       'AUT', 'https://flagcdn.com/w80/at.png',    'Group J'),
('Jordan',                        'JOR', 'https://flagcdn.com/w80/jo.png',    'Group J'),
-- Group K
('Portugal',                      'POR', 'https://flagcdn.com/w80/pt.png',    'Group K'),
('DR Congo',                      'COD', 'https://flagcdn.com/w80/cd.png',    'Group K'),
('Uzbekistan',                    'UZB', 'https://flagcdn.com/w80/uz.png',    'Group K'),
('Colombia',                      'COL', 'https://flagcdn.com/w80/co.png',    'Group K'),
-- Group L
('England',                       'ENG', 'https://flagcdn.com/w80/gb-eng.png','Group L'),
('Croatia',                       'CRO', 'https://flagcdn.com/w80/hr.png',    'Group L'),
('Ghana',                         'GHA', 'https://flagcdn.com/w80/gh.png',    'Group L'),
('Panama',                        'PAN', 'https://flagcdn.com/w80/pa.png',    'Group L');


-- ============================================================
-- MATCHES — Real fixtures from WorldCup26 API
-- local_date from API is US Eastern time (EDT = UTC-4 in June).
-- All times stored with -04 offset. lock_time = kickoff - 1hr.
-- external_id matches the API game id exactly.
-- home_score/away_score/status reflect live API state as of seed time.
-- Finished matches include real scores; future ones are SCHEDULED.
-- ============================================================

-- Helper: map team names to their DB ids via code
-- (DB insert order above = API id order, so code lookups are safe)

-- ===================== GROUP A =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (1, (SELECT id FROM teams WHERE code='MEX'), (SELECT id FROM teams WHERE code='RSA'),
  '2026-06-11 15:00:00-04', '2026-06-11 14:00:00-04', 'Group A', 'SoFi Stadium, Los Angeles', 'FINISHED', 2, 1);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (2, (SELECT id FROM teams WHERE code='KOR'), (SELECT id FROM teams WHERE code='CZE'),
  '2026-06-11 18:00:00-04', '2026-06-11 17:00:00-04', 'Group A', 'AT&T Stadium, Dallas', 'FINISHED', 2, 1);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (21, (SELECT id FROM teams WHERE code='MEX'), (SELECT id FROM teams WHERE code='KOR'),
  '2026-06-17 15:00:00-04', '2026-06-17 14:00:00-04', 'Group A', 'Estadio Akron, Guadalajara', 'FINISHED', 1, 0);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (22, (SELECT id FROM teams WHERE code='CZE'), (SELECT id FROM teams WHERE code='RSA'),
  '2026-06-17 18:00:00-04', '2026-06-17 17:00:00-04', 'Group A', 'Estadio BBVA, Monterrey', 'FINISHED', 2, 2);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (61, (SELECT id FROM teams WHERE code='RSA'), (SELECT id FROM teams WHERE code='KOR'),
  '2026-06-22 15:00:00-04', '2026-06-22 14:00:00-04', 'Group A', 'Estadio Azteca, Mexico City', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (62, (SELECT id FROM teams WHERE code='CZE'), (SELECT id FROM teams WHERE code='MEX'),
  '2026-06-22 15:00:00-04', '2026-06-22 14:00:00-04', 'Group A', 'SoFi Stadium, Los Angeles', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP B =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (3, (SELECT id FROM teams WHERE code='CAN'), (SELECT id FROM teams WHERE code='BIH'),
  '2026-06-12 12:00:00-04', '2026-06-12 11:00:00-04', 'Group B', 'BMO Field, Toronto', 'FINISHED', 2, 0);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (4, (SELECT id FROM teams WHERE code='QAT'), (SELECT id FROM teams WHERE code='SUI'),
  '2026-06-12 15:00:00-04', '2026-06-12 14:00:00-04', 'Group B', 'BC Place, Vancouver', 'FINISHED', 4, 1);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (23, (SELECT id FROM teams WHERE code='CAN'), (SELECT id FROM teams WHERE code='QAT'),
  '2026-06-17 12:00:00-04', '2026-06-17 11:00:00-04', 'Group B', 'BMO Field, Toronto', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (24, (SELECT id FROM teams WHERE code='SUI'), (SELECT id FROM teams WHERE code='BIH'),
  '2026-06-17 15:00:00-04', '2026-06-17 14:00:00-04', 'Group B', 'BC Place, Vancouver', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (63, (SELECT id FROM teams WHERE code='BIH'), (SELECT id FROM teams WHERE code='QAT'),
  '2026-06-22 12:00:00-04', '2026-06-22 11:00:00-04', 'Group B', 'BC Place, Vancouver', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (64, (SELECT id FROM teams WHERE code='SUI'), (SELECT id FROM teams WHERE code='CAN'),
  '2026-06-22 12:00:00-04', '2026-06-22 11:00:00-04', 'Group B', 'BMO Field, Toronto', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP C =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (5, (SELECT id FROM teams WHERE code='BRA'), (SELECT id FROM teams WHERE code='HAI'),
  '2026-06-13 12:00:00-04', '2026-06-13 11:00:00-04', 'Group C', 'MetLife Stadium, New Jersey', 'FINISHED', 0, 1);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (7, (SELECT id FROM teams WHERE code='MAR'), (SELECT id FROM teams WHERE code='SCO'),
  '2026-06-13 18:00:00-04', '2026-06-13 17:00:00-04', 'Group C', 'Gillette Stadium, Boston', 'FINISHED', 1, 1);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (25, (SELECT id FROM teams WHERE code='BRA'), (SELECT id FROM teams WHERE code='MAR'),
  '2026-06-18 15:00:00-04', '2026-06-18 14:00:00-04', 'Group C', 'MetLife Stadium, New Jersey', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (26, (SELECT id FROM teams WHERE code='SCO'), (SELECT id FROM teams WHERE code='HAI'),
  '2026-06-18 18:00:00-04', '2026-06-18 17:00:00-04', 'Group C', 'Gillette Stadium, Boston', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (65, (SELECT id FROM teams WHERE code='HAI'), (SELECT id FROM teams WHERE code='MAR'),
  '2026-06-23 12:00:00-04', '2026-06-23 11:00:00-04', 'Group C', 'Gillette Stadium, Boston', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (66, (SELECT id FROM teams WHERE code='SCO'), (SELECT id FROM teams WHERE code='BRA'),
  '2026-06-23 12:00:00-04', '2026-06-23 11:00:00-04', 'Group C', 'MetLife Stadium, New Jersey', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP D =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (6, (SELECT id FROM teams WHERE code='AUS'), (SELECT id FROM teams WHERE code='TUR'),
  '2026-06-13 21:00:00-04', '2026-06-13 20:00:00-04', 'Group D', 'AT&T Stadium, Dallas', 'FINISHED', 2, 0);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (8, (SELECT id FROM teams WHERE code='USA'), (SELECT id FROM teams WHERE code='PAR'),
  '2026-06-14 15:00:00-04', '2026-06-14 14:00:00-04', 'Group D', 'SoFi Stadium, Los Angeles', 'FINISHED', 1, 1);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (31, (SELECT id FROM teams WHERE code='USA'), (SELECT id FROM teams WHERE code='AUS'),
  '2026-06-19 12:00:00-04', '2026-06-19 11:00:00-04', 'Group D', 'Hard Rock Stadium, Miami', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (32, (SELECT id FROM teams WHERE code='TUR'), (SELECT id FROM teams WHERE code='PAR'),
  '2026-06-19 15:00:00-04', '2026-06-19 14:00:00-04', 'Group D', 'AT&T Stadium, Dallas', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (67, (SELECT id FROM teams WHERE code='PAR'), (SELECT id FROM teams WHERE code='AUS'),
  '2026-06-24 12:00:00-04', '2026-06-24 11:00:00-04', 'Group D', 'Hard Rock Stadium, Miami', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (68, (SELECT id FROM teams WHERE code='TUR'), (SELECT id FROM teams WHERE code='USA'),
  '2026-06-24 12:00:00-04', '2026-06-24 11:00:00-04', 'Group D', 'SoFi Stadium, Los Angeles', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP E =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (9, (SELECT id FROM teams WHERE code='GER'), (SELECT id FROM teams WHERE code='CUW'),
  '2026-06-14 12:00:00-04', '2026-06-14 11:00:00-04', 'Group E', 'Lincoln Financial Field, Philadelphia', 'FINISHED', 5, 0);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (10, (SELECT id FROM teams WHERE code='CIV'), (SELECT id FROM teams WHERE code='ECU'),
  '2026-06-14 18:00:00-04', '2026-06-14 17:00:00-04', 'Group E', 'NRG Stadium, Houston', 'FINISHED', 7, 1);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (33, (SELECT id FROM teams WHERE code='GER'), (SELECT id FROM teams WHERE code='CIV'),
  '2026-06-20 16:00:00-04', '2026-06-20 15:00:00-04', 'Group E', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (34, (SELECT id FROM teams WHERE code='ECU'), (SELECT id FROM teams WHERE code='CUW'),
  '2026-06-20 12:00:00-04', '2026-06-20 11:00:00-04', 'Group E', 'NRG Stadium, Houston', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (69, (SELECT id FROM teams WHERE code='CUW'), (SELECT id FROM teams WHERE code='CIV'),
  '2026-06-25 12:00:00-04', '2026-06-25 11:00:00-04', 'Group E', 'NRG Stadium, Houston', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (70, (SELECT id FROM teams WHERE code='ECU'), (SELECT id FROM teams WHERE code='GER'),
  '2026-06-25 12:00:00-04', '2026-06-25 11:00:00-04', 'Group E', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP F =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (11, (SELECT id FROM teams WHERE code='NED'), (SELECT id FROM teams WHERE code='TUN'),
  '2026-06-14 21:00:00-04', '2026-06-14 20:00:00-04', 'Group F', 'Lumen Field, Seattle', 'FINISHED', 5, 1);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (12, (SELECT id FROM teams WHERE code='JPN'), (SELECT id FROM teams WHERE code='SWE'),
  '2026-06-15 15:00:00-04', '2026-06-15 14:00:00-04', 'Group F', 'Rose Bowl, Los Angeles', 'FINISHED', 2, 2);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (35, (SELECT id FROM teams WHERE code='NED'), (SELECT id FROM teams WHERE code='SWE'),
  '2026-06-20 12:00:00-04', '2026-06-20 11:00:00-04', 'Group F', 'Lumen Field, Seattle', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (36, (SELECT id FROM teams WHERE code='TUN'), (SELECT id FROM teams WHERE code='JPN'),
  '2026-06-20 15:00:00-04', '2026-06-20 14:00:00-04', 'Group F', 'Rose Bowl, Los Angeles', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (71, (SELECT id FROM teams WHERE code='SWE'), (SELECT id FROM teams WHERE code='TUN'),
  '2026-06-25 15:00:00-04', '2026-06-25 14:00:00-04', 'Group F', 'Rose Bowl, Los Angeles', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (59, (SELECT id FROM teams WHERE code='JPN'), (SELECT id FROM teams WHERE code='SWE'),
  '2026-06-25 18:00:00-04', '2026-06-25 17:00:00-04', 'Group F', 'Lumen Field, Seattle', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP G =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (13, (SELECT id FROM teams WHERE code='BEL'), (SELECT id FROM teams WHERE code='NZL'),
  '2026-06-15 12:00:00-04', '2026-06-15 11:00:00-04', 'Group G', 'Mercedes-Benz Stadium, Atlanta', 'FINISHED', 1, 1);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (14, (SELECT id FROM teams WHERE code='EGY'), (SELECT id FROM teams WHERE code='IRN'),
  '2026-06-15 18:00:00-04', '2026-06-15 17:00:00-04', 'Group G', 'Arrowhead Stadium, Kansas City', 'FINISHED', 2, 2);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (37, (SELECT id FROM teams WHERE code='BEL'), (SELECT id FROM teams WHERE code='EGY'),
  '2026-06-20 18:00:00-04', '2026-06-20 17:00:00-04', 'Group G', 'Mercedes-Benz Stadium, Atlanta', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (38, (SELECT id FROM teams WHERE code='NZL'), (SELECT id FROM teams WHERE code='IRN'),
  '2026-06-21 12:00:00-04', '2026-06-21 11:00:00-04', 'Group G', 'Arrowhead Stadium, Kansas City', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (72, (SELECT id FROM teams WHERE code='IRN'), (SELECT id FROM teams WHERE code='BEL'),
  '2026-06-25 15:00:00-04', '2026-06-25 14:00:00-04', 'Group G', 'Arrowhead Stadium, Kansas City', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (73, (SELECT id FROM teams WHERE code='NZL'), (SELECT id FROM teams WHERE code='EGY'),
  '2026-06-25 15:00:00-04', '2026-06-25 14:00:00-04', 'Group G', 'Mercedes-Benz Stadium, Atlanta', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP H =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (15, (SELECT id FROM teams WHERE code='ESP'), (SELECT id FROM teams WHERE code='URU'),
  '2026-06-15 21:00:00-04', '2026-06-15 20:00:00-04', 'Group H', 'Hard Rock Stadium, Miami', 'FINISHED', 1, 1);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (16, (SELECT id FROM teams WHERE code='KSA'), (SELECT id FROM teams WHERE code='CPV'),
  '2026-06-16 15:00:00-04', '2026-06-16 14:00:00-04', 'Group H', 'Camping World Stadium, Orlando', 'FINISHED', 1, 1);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (39, (SELECT id FROM teams WHERE code='ESP'), (SELECT id FROM teams WHERE code='KSA'),
  '2026-06-21 15:00:00-04', '2026-06-21 14:00:00-04', 'Group H', 'Hard Rock Stadium, Miami', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (40, (SELECT id FROM teams WHERE code='URU'), (SELECT id FROM teams WHERE code='CPV'),
  '2026-06-21 18:00:00-04', '2026-06-21 17:00:00-04', 'Group H', 'Camping World Stadium, Orlando', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (74, (SELECT id FROM teams WHERE code='CPV'), (SELECT id FROM teams WHERE code='ESP'),
  '2026-06-26 12:00:00-04', '2026-06-26 11:00:00-04', 'Group H', 'Camping World Stadium, Orlando', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (75, (SELECT id FROM teams WHERE code='URU'), (SELECT id FROM teams WHERE code='KSA'),
  '2026-06-26 12:00:00-04', '2026-06-26 11:00:00-04', 'Group H', 'Hard Rock Stadium, Miami', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP I =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (17, (SELECT id FROM teams WHERE code='FRA'), (SELECT id FROM teams WHERE code='SEN'),
  '2026-06-16 12:00:00-04', '2026-06-16 11:00:00-04', 'Group I', 'Levi''s Stadium, San Francisco', 'FINISHED', 1, 0);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (18, (SELECT id FROM teams WHERE code='NOR'), (SELECT id FROM teams WHERE code='IRQ'),
  '2026-06-16 18:00:00-04', '2026-06-16 17:00:00-04', 'Group I', 'Rose Bowl, Los Angeles', 'FINISHED', 2, 2);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (41, (SELECT id FROM teams WHERE code='FRA'), (SELECT id FROM teams WHERE code='IRQ'),
  '2026-06-22 17:00:00-04', '2026-06-22 16:00:00-04', 'Group I', 'Levi''s Stadium, San Francisco', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (42, (SELECT id FROM teams WHERE code='NOR'), (SELECT id FROM teams WHERE code='SEN'),
  '2026-06-22 20:00:00-04', '2026-06-22 19:00:00-04', 'Group I', 'Rose Bowl, Los Angeles', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (76, (SELECT id FROM teams WHERE code='SEN'), (SELECT id FROM teams WHERE code='IRQ'),
  '2026-06-27 12:00:00-04', '2026-06-27 11:00:00-04', 'Group I', 'Rose Bowl, Los Angeles', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (77, (SELECT id FROM teams WHERE code='NOR'), (SELECT id FROM teams WHERE code='FRA'),
  '2026-06-27 12:00:00-04', '2026-06-27 11:00:00-04', 'Group I', 'Levi''s Stadium, San Francisco', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP J =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (19, (SELECT id FROM teams WHERE code='ARG'), (SELECT id FROM teams WHERE code='ALG'),
  '2026-06-16 21:00:00-04', '2026-06-16 20:00:00-04', 'Group J', 'MetLife Stadium, New Jersey', 'FINISHED', 2, 0);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (20, (SELECT id FROM teams WHERE code='AUT'), (SELECT id FROM teams WHERE code='JOR'),
  '2026-06-17 12:00:00-04', '2026-06-17 11:00:00-04', 'Group J', 'Arrowhead Stadium, Kansas City', 'FINISHED', 1, 1);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (43, (SELECT id FROM teams WHERE code='ARG'), (SELECT id FROM teams WHERE code='AUT'),
  '2026-06-22 12:00:00-04', '2026-06-22 11:00:00-04', 'Group J', 'MetLife Stadium, New Jersey', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (44, (SELECT id FROM teams WHERE code='JOR'), (SELECT id FROM teams WHERE code='ALG'),
  '2026-06-22 15:00:00-04', '2026-06-22 14:00:00-04', 'Group J', 'Arrowhead Stadium, Kansas City', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (78, (SELECT id FROM teams WHERE code='ALG'), (SELECT id FROM teams WHERE code='AUT'),
  '2026-06-27 15:00:00-04', '2026-06-27 14:00:00-04', 'Group J', 'Arrowhead Stadium, Kansas City', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (79, (SELECT id FROM teams WHERE code='JOR'), (SELECT id FROM teams WHERE code='ARG'),
  '2026-06-27 15:00:00-04', '2026-06-27 14:00:00-04', 'Group J', 'MetLife Stadium, New Jersey', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP K =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (27, (SELECT id FROM teams WHERE code='POR'), (SELECT id FROM teams WHERE code='COL'),
  '2026-06-17 21:00:00-04', '2026-06-17 20:00:00-04', 'Group K', 'Lumen Field, Seattle', 'FINISHED', 1, 1);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (28, (SELECT id FROM teams WHERE code='COD'), (SELECT id FROM teams WHERE code='UZB'),
  '2026-06-18 12:00:00-04', '2026-06-18 11:00:00-04', 'Group K', 'Camping World Stadium, Orlando', 'SCHEDULED', NULL, NULL);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (45, (SELECT id FROM teams WHERE code='POR'), (SELECT id FROM teams WHERE code='COD'),
  '2026-06-23 15:00:00-04', '2026-06-23 14:00:00-04', 'Group K', 'Lumen Field, Seattle', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (46, (SELECT id FROM teams WHERE code='COL'), (SELECT id FROM teams WHERE code='UZB'),
  '2026-06-23 18:00:00-04', '2026-06-23 17:00:00-04', 'Group K', 'Camping World Stadium, Orlando', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (80, (SELECT id FROM teams WHERE code='UZB'), (SELECT id FROM teams WHERE code='POR'),
  '2026-06-28 12:00:00-04', '2026-06-28 11:00:00-04', 'Group K', 'Camping World Stadium, Orlando', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (81, (SELECT id FROM teams WHERE code='COL'), (SELECT id FROM teams WHERE code='COD'),
  '2026-06-28 12:00:00-04', '2026-06-28 11:00:00-04', 'Group K', 'Lumen Field, Seattle', 'SCHEDULED', NULL, NULL);

-- ===================== GROUP L =====================
-- Matchday 1
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (29, (SELECT id FROM teams WHERE code='ENG'), (SELECT id FROM teams WHERE code='CRO'),
  '2026-06-18 18:00:00-04', '2026-06-18 17:00:00-04', 'Group L', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (30, (SELECT id FROM teams WHERE code='GHA'), (SELECT id FROM teams WHERE code='PAN'),
  '2026-06-18 21:00:00-04', '2026-06-18 20:00:00-04', 'Group L', 'AT&T Stadium, Dallas', 'SCHEDULED', NULL, NULL);

-- Matchday 2
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (47, (SELECT id FROM teams WHERE code='ENG'), (SELECT id FROM teams WHERE code='GHA'),
  '2026-06-23 21:00:00-04', '2026-06-23 20:00:00-04', 'Group L', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (48, (SELECT id FROM teams WHERE code='CRO'), (SELECT id FROM teams WHERE code='PAN'),
  '2026-06-24 15:00:00-04', '2026-06-24 14:00:00-04', 'Group L', 'AT&T Stadium, Dallas', 'SCHEDULED', NULL, NULL);

-- Matchday 3
INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (82, (SELECT id FROM teams WHERE code='PAN'), (SELECT id FROM teams WHERE code='ENG'),
  '2026-06-28 15:00:00-04', '2026-06-28 14:00:00-04', 'Group L', 'AT&T Stadium, Dallas', 'SCHEDULED', NULL, NULL);

INSERT INTO matches (external_id, home_team_id, away_team_id, match_date, lock_time, stage, venue, status, home_score, away_score)
VALUES (83, (SELECT id FROM teams WHERE code='GHA'), (SELECT id FROM teams WHERE code='CRO'),
  '2026-06-28 15:00:00-04', '2026-06-28 14:00:00-04', 'Group L', 'Lincoln Financial Field, Philadelphia', 'SCHEDULED', NULL, NULL);

-- ============================================================
-- Verify counts
-- ============================================================
SELECT COUNT(*) AS total_teams  FROM teams;
SELECT COUNT(*) AS total_matches FROM matches;
SELECT status, COUNT(*) FROM matches GROUP BY status ORDER BY status;
