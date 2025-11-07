/**
 * Authentication Middleware
 * Protects admin endpoints with API key authentication
 */

/**
 * Middleware to authenticate admin requests using API key
 * Expects 'x-api-key' header with valid admin API key
 */
export const authenticateAdmin = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.ADMIN_API_KEY;

  // If ADMIN_API_KEY is not set, warn and block all admin requests
  if (!validApiKey) {
    console.warn('⚠️  ADMIN_API_KEY not configured. Admin endpoints are disabled.');
    return res.status(503).json({
      error: 'Admin authentication not configured',
      message: 'Please contact the administrator to configure ADMIN_API_KEY'
    });
  }

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide x-api-key header'
    });
  }

  // Validate API key
  if (apiKey !== validApiKey) {
    // Log failed authentication attempts
    console.warn(`⚠️  Failed admin authentication attempt from IP: ${req.ip}`);
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // Authentication successful
  console.log(`✅ Admin authenticated from IP: ${req.ip}`);
  next();
};

/**
 * Optional authentication - allows requests without auth but logs them
 * Useful for endpoints that should be tracked but not blocked
 */
export const optionalAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    req.isAuthenticated = true;
    req.userId = 'admin'; // You can extend this to support multiple users
  } else {
    req.isAuthenticated = false;
  }

  next();
};

/**
 * Check if request is from authenticated admin
 */
export const isAdmin = (req) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.ADMIN_API_KEY;
  return apiKey && validApiKey && apiKey === validApiKey;
};

export default {
  authenticateAdmin,
  optionalAuth,
  isAdmin
};
