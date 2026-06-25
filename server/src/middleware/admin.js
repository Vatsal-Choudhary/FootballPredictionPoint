/**
 * Admin authorization middleware.
 * Must be used AFTER the auth middleware so that req.user is populated.
 * Returns 403 if the authenticated user is not an admin.
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required before admin check.' });
  }

  if (req.user.is_admin !== true) {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  next();
};

export default admin;
