// =====================================================
// server/middleware/auth.js  —  JWT verification
// =====================================================
// This function runs BEFORE any protected route handler.
// It checks that the request has a valid JWT token.
//
// How it works:
//   1. Client sends: Authorization: Bearer <token>
//   2. We extract the token from that header
//   3. We verify it using our JWT_SECRET
//   4. If valid, we attach the user's id to req.user
//   5. If invalid or missing, we return 401 Unauthorized
// =====================================================

import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Get the Authorization header: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Extract the token part (after "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token — this throws if invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info to the request object
    // Now any route after this middleware can use req.user.id
    req.user = decoded;

    next(); // move on to the route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export default auth;
