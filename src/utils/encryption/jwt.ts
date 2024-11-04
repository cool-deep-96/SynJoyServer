import { NextFunction, Response } from "express";
import { CustomRequest, TokenData } from "../../common/interfaces";
import jwt from "jsonwebtoken";
import logger from "../../logging/logger";

export const generateJwtToken = (tokenData: TokenData): string => {
  return jwt.sign(tokenData, process.env.SECRETE_KEY!, {
    expiresIn: "1d",
  });
};

export const validateJwtToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header is missing or invalid" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRETE_KEY!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
