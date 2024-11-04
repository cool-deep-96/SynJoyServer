import { Response } from "express";
import { CustomRequest, TokenData } from "../common/interfaces";
import { generateJwtToken } from "../utils/encryption/jwt";
import { Types } from "mongoose";
import logger from "../logging/logger";
import { getRoomById } from "../services/room_service";

export const getRefreshToken = async (req: CustomRequest, res: Response) => {
  try {
    const user = req.user as TokenData;

    if (!user) {
      logger.warn("User data not found in request.");
      return res.status(403).json({
        success: false,
        message: "User not authorized",
      });
    }

    const room = await getRoomById(user.roomId);
    if (!room) {
      logger.warn(`Room not found for roomId: ${user.roomId}`);
      return res.status(404).json({
        success: false,
        message: `Room not found for roomId: ${user.roomId}`,
      });
    }

    const isMember = (room.memberIds as Types.ObjectId[]).some((id) =>
      id.equals(user.id)
    );
    const isOwner = (room.ownerId as Types.ObjectId).equals(user.id);
    const tokenData: TokenData = {
      id: user.id,
      userName: user.userName,
      roomId: user.roomId,
      expireAt: user.expireAt,
      isMember,
      isOwner,
    };

    // Generate the new JWT token
    const jwtToken = generateJwtToken(tokenData);

    logger.info(
      `New JWT token generated for user: ${user.userName}, roomId: ${user.roomId}`
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      jwtToken,
    });
  } catch (error) {
    // Enhanced error logging
    if (error instanceof Error) {
      logger.error(`Error refreshing token: ${error.message}`, {
        stack: error.stack,
      });
    } else {
      logger.error("Unexpected error occurred during token refresh", { error });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong while refreshing the token",
    });
  }
};
