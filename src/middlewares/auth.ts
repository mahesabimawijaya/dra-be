import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface JwtPayload {
  userId: string;
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(401).json({ message: "Access Denied" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err instanceof Error && err.name === "TokenExpiredError") {
      res.status(401).json({ message: "Unauthorized. Token has expired." });
      return;
    }
    if (err instanceof Error && err.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Unauthorized. Invalid token." });
      return;
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
}
