const userModel = require("../model/user.model");
const jwt = require("jsonwebtoken");

/**
 * Authenticates the user based on JWT token in the Authorization header
 */
module.exports.authenticate = async (req, res, next) => {
  // Check if Authorization header exists and has the correct format
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid token format" });
  }

  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // JWT verify is synchronous, no need for await
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Token is invalid: User not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    // Handle different JWT errors with appropriate responses
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    } else if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Token expired" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};

/**
 * Middleware to check if the authenticated user has one of the allowed roles
 * @param {Array} roles - Array of allowed roles
 */
module.exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};
