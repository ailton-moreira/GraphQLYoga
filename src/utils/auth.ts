import jwt from "jsonwebtoken";
import { Request } from "express";

export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface JwtPayload {
  userId: string;
}

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
};

export const getUserId = (request: Request, requireAuth = true): string => {
  const header =
    request.headers.get("authorization") || request.headers.authorization;

  if (header) {
    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded.userId;
  }

  if (requireAuth) {
    throw new Error("Authentication required");
  }

  return "";
};
