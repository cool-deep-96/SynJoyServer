import { Response } from "express";
import logger from "../../logging/logger";
import { IUser } from "../../models/User.model";
import { Member, Message, TokenData } from "../../common/interfaces";
import { Types } from "mongoose";
import { getRoomById } from "../../services/room_service";
import { getUserService } from "../../services/user_service";
import { io } from "../../app";
import { userSocketMap } from "../../../sokets2";
import { SOCKET_CHANNEL } from "../../common/socket_channels";

export const handleError = (res: Response, error: any) => {
  logger.error(error instanceof Error ? error.message : "Something Went Wrong");
  res.status(400).json({
    success: false,
    message: error instanceof Error ? error.message : "Something Went Wrong",
  });
};

export const generateTokenData = (
  user: IUser,
  roomId: string,
  isOwner: boolean,
  isMember: boolean
): TokenData => {
  return {
    id: user.id,
    userName: user.userName,
    roomId,
    expireAt: user.expireAt,
    isMember,
    isOwner,
  };
};

// Helper function to validate room and user
export const validateRoomAndUser = async (roomId: string, userName: string) => {
  const room = await getRoomById(roomId);
  if (!room) throw new Error(`Room not found for roomId: ${roomId}`);

  const user = await getUserService(userName);
  if (!user) throw new Error(`User not found for userName: ${userName}`);

  return { room, user };
};

export const checkingRoomAndUser = async (roomId: string, userName: string) => {
  const room = await getRoomById(roomId);

  const user = await getUserService(userName);

  return { room, user };
};

// Emit join request to room owner
export const emitJoinRequest = (room: any, user: any) => {
  const ownerSocket = userSocketMap.get(room.ownerId.id);
  if (ownerSocket) {
    const payload: Member = {
      id: user.id,
      userName: user.userName,
      roomId: room.roomId,
      isMember: false,
      isOwner: false,
    };
    io.to(ownerSocket.socketId).emit("join-request-channel", payload);
    //logger.info("Emit approval request to room owner", payload);
  } else {
    logger.error("Owner socket not found", { ownerId: room.ownerId.id });
  }
};

// Emit approval to new member
export const emitApprovalToUser = (
  userId: string,
  userName: string,
  roomId: string,
  isMember: boolean,
  isOwner: boolean,
  isSelf?: boolean,
) => {
  //logger.info("userId ", { userId });
  const userSocket = userSocketMap.get(userId);
  if (userSocket) {
    const payload: Member = {
      id: userId,
      userName,
      roomId,
      isMember,
      isOwner,
      isSelf
    };
    io.to(userSocket.socketId).emit(SOCKET_CHANNEL.JOIN_APPROVE_CHANNEL, payload);
    //logger.info("Emit approval status to new member", payload);
  } else {
    logger.error("User socket not found", { userId });
  }
};

export const emitJoinedSyncToRoom = (
  userId: string,
  userName: string,
  roomId: string,
  isMember: boolean,
  isOwner: boolean,
  isSelf?: boolean
) => {
  const payload: Member = {
    id: userId,
    userName: userName,
    roomId,
    isMember,
    isOwner,
    isSelf
  };
  io.to(roomId).emit(SOCKET_CHANNEL.SYNC_JOINED_LIST, payload);
  //logger.info(
  //   `Broadcast: Notified all users in room ${roomId} about user ${userId}'s removal`
  // );
};

export const emitChatSyncToRoom = (
  id: string,
  sentById: string,
  sentByUserName: string,
  text: string,
  time: string,
  isRemoved: boolean,
  roomId: string
) => {
  const payload: Message = {
    id,
    sentById,
    sentByUserName,
    text,
    time,
    isRemoved,
  };
  io.to(roomId).emit(SOCKET_CHANNEL.SYNC_CHAT_CHANNEL, payload);
  //logger.info(
  //   `Broadcast: Notified all users in room ${roomId} new chat removal`
  // );
};
