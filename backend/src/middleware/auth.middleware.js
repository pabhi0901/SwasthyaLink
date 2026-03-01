import jwt from "jsonwebtoken"

export const authCreatorFunction = (role) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.token

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please login."
        })
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      if (!role.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions."
        })
      }

      req.user = decoded
      next()

    } catch (error) {
        console.log(error);
        
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      })
    }
  }
}

export default authCreatorFunction