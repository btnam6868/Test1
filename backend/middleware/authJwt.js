const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js"); // Need User model to fetch fresh permissions if needed
const jwtSecret = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"]; // Check common headers

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  // If token is in 'Bearer <token>' format, extract the token part
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, jwtSecret, async (err, decoded) => {
    if (err) {
      // Handle specific errors like token expiration
      if (err.name === 'TokenExpiredError') {
        return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
      }
      // Handle other verification errors
      return res.status(401).send({ message: "Unauthorized! Invalid Token." });
    }

    // Token is valid, attach user ID and potentially roles/permissions to the request object
    req.userId = decoded.id;

    // Optional: Attach roles and permissions directly from the decoded token
    // This is faster but relies on the token not being stale regarding permissions
    req.userRoles = decoded.roles || [];
    req.userPermissions = decoded.permissions || [];

    // // Alternative (Slower but always fresh): Fetch user details on every request
    // try {
    //   const user = await User.findById(decoded.id);
    //   if (!user) {
    //     return res.status(404).send({ message: "User associated with token not found." });
    //   }
    //   if (!user.is_active) {
    //     return res.status(403).send({ message: "User account is inactive." });
    //   }
    //   req.userRoles = user.roles;
    //   req.userPermissions = user.permissions;
    // } catch (error) {
    //   return res.status(500).send({ message: "Error fetching user details for authorization." });
    // }

    next(); // Proceed to the next middleware or route handler
  });
};

// Middleware to check if user has required role(s)
const hasRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.userRoles || req.userRoles.length === 0) {
      return res.status(403).send({ message: "Forbidden! User has no assigned roles." });
    }

    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const hasRequiredRole = rolesToCheck.some(role => req.userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).send({ message: `Forbidden! Requires one of the following roles: ${rolesToCheck.join(', ')}` });
    }
    next();
  };
};

// Middleware to check if user has required permission(s)
const hasPermission = (requiredPermissions) => {
    return (req, res, next) => {
      if (!req.userPermissions || req.userPermissions.length === 0) {
        return res.status(403).send({ message: "Forbidden! User has no assigned permissions." });
      }

      const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      const hasRequiredPermission = permissionsToCheck.every(permission => req.userPermissions.includes(permission)); // Use 'every' for all required

      if (!hasRequiredPermission) {
        return res.status(403).send({ message: `Forbidden! Requires all of the following permissions: ${permissionsToCheck.join(', ')}` });
      }
      next();
    };
  };


const authJwt = {
  verifyToken,
  hasRole,
  hasPermission
  // Add isAdmin, isManager etc. as shortcuts if needed:
  // isAdmin: hasRole('Admin'),
  // isManager: hasRole('Manager')
};

module.exports = authJwt;
