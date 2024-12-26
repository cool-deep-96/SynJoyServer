import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomRequest, TokenData } from "../../common/interfaces";

export const generateJwtToken = (tokenData: TokenData): string => {
  return jwt.sign(tokenData, process.env.SECRETE_KEY!, {
    expiresIn: "1d",
  });
};

export const validateJwtToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ message: "Authorization header is missing or invalid" });
      return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRETE_KEY!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
