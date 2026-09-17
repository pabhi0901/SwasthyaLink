import * as cookie from "cookie";
import jwt from "jsonwebtoken";

const parseCookies = (cookieHeader = "") => {
  if (!cookieHeader) return {};
  if (typeof cookie.parseCookie === "function") {
    return cookie.parseCookie(cookieHeader);
  }
  if (typeof cookie.parse === "function") {
    return cookie.parse(cookieHeader);
  }
  if (typeof cookie.default?.parse === "function") {
    return cookie.default.parse(cookieHeader);
  }
  return Object.fromEntries(
    cookieHeader.split(";").map(c => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
};

export default async function registerAuthMiddleware(io) {
  io.use((socket, next) => {
    try {
      const rawCookies = socket.handshake.headers?.cookie || socket.request?.headers?.cookie || "";
      const cookies = parseCookies(rawCookies);
      const token =
        cookies.token ||
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        console.log("Socket connection rejected: No token provided");
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT here
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.token = token;

      console.log(`Socket authenticated for user: ${decoded.userId} (${decoded.role || "user"})`);
      next();
    } catch (err) {
      console.log("Socket connection rejected: Invalid token", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });
}
