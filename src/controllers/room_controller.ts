import { Request, Response } from "express";
import {
  CreateRoomPayload,
  CustomRequest,
  JoinRoomPayload,
  Member,
  TokenData,
} from "../common/interfaces";
import { generateJwtToken } from "../utils/encryption/jwt";
import {
  checkingRoomAndUser,
  emitApprovalToUser,
  emitJoinRequest,
  emitJoinedSyncToRoom,
  generateTokenData,
  handleError,
  validateRoomAndUser,
} from "../utils/room_controller/room_controller";
import { validateCreateRoomPayload } from "../utils/validate";
import logger from "../logging/logger";
import { hashText } from "../utils/encryption/bcrypt";
import {
  createUserService,
  getUserService,
  updateExpireAtUserService,
} from "../services/user_service";
import {
  createRoom,
  deleteRoomById,
  getRoomById,
  getRoomMembers,
  joinRoom,
  leaveRoom,
  requestToJoinRoom,
} from "../services/room_service";
import { Types } from "mongoose";
import { deleteAllChatsInRoom } from "../services/chat_service";
import { compareSync } from "bcryptjs";

export const createRoomR = async (req: Request, res: Response) => {
  try {
    const { createRoomPayload } = req.body;
    validateCreateRoomPayload(createRoomPayload as CreateRoomPayload);

    const { roomId, userName, password } = createRoomPayload;

    // Check if room or user already exists
    if (await getRoomById(roomId))
      throw new Error(`RoomId already exists: ${roomId}`);
    if (await getUserService(userName))
      throw new Error(`UserName already exists: ${userName}`);

    const hashPassword = await hashText(password);
    const user = await createUserService(userName, hashPassword);
    const room = await createRoom(
      roomId,
      user.id as Types.ObjectId,
      user.expireAt
    );

    const tokenData: TokenData = {
      id: user.id,
      roomId,
      userName,
      isMember: true,
      isOwner: true,
      expireAt: user.expireAt,
    };
    const jwtToken = generateJwtToken(tokenData);

    logger.info("Room created successfully", { roomId, userName });
    res.status(200).json({
      success: true,
      message: `Room '${room.roomId}' created`,
      jwtToken,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const requestJoinRoom = async (req: Request, res: Response) => {
  try {
    const { joinRoomPayload } = req.body;
    validateCreateRoomPayload(joinRoomPayload as JoinRoomPayload);

    let { room, user } = await checkingRoomAndUser(
      joinRoomPayload.roomId,
      joinRoomPayload.userName
    );

    if (!room)
      throw new Error(`Room not found for roomId: ${joinRoomPayload.roomId}`);

    if (user && !compareSync(joinRoomPayload.password, user?.password)) {
      throw new Error(
        `Incorrect password for userName: ${joinRoomPayload.userName}`
      );
    }

    // Check if user is already a member
    if (user && (room.memberIds as Types.ObjectId[]).includes(user.id)) {
      const isOwner = (room.ownerId as Types.ObjectId).equals(user.id);
      const tokenData = generateTokenData(user, room.roomId, isOwner, true);
      const jwtToken = generateJwtToken(tokenData);
      return res.status(200).json({
        success: true,
        message: `${user.userName} is already a member`,
        jwtToken,
      });
    }

    if (!user) {
      // Create user if not found
      const hashPassword = await hashText(joinRoomPayload.password);
      user = await createUserService(
        joinRoomPayload.userName,
        hashPassword,
        room.expireAt
      );
    }

    await requestToJoinRoom(user.id as Types.ObjectId, room.roomId);
    emitJoinRequest(room, user);

    const tokenData = generateTokenData(user, room.roomId, false, false);
    const jwtToken = generateJwtToken(tokenData);
    logger.info("Request to join room sent", {
      roomId: room.roomId,
      userName: user.userName,
    });
    res.status(200).json({
      success: true,
      message: "Approval request sent to owner",
      jwtToken,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const joinRoomR = async (req: CustomRequest, res: Response) => {
  try {
    const tokenData = req.user as TokenData;

    const { room, user } = await validateRoomAndUser(
      tokenData.roomId,
      tokenData.userName
    );

    if ((room.memberIds as Types.ObjectId[]).includes(user.id)) {
      const isOwner = (room.ownerId as Types.ObjectId).equals(user.id);
      const tokenData = generateTokenData(user, room.roomId, isOwner, true);
      const jwtToken = generateJwtToken(tokenData);
      return res
        .status(200)
        .json({ success: true, message: "Already a member", jwtToken });
    }

    await requestToJoinRoom(user.id, room.roomId);
    emitJoinRequest(room, user);

    const tokenDataNew = generateTokenData(user, room.roomId, false, false);
    const jwtToken = generateJwtToken(tokenDataNew);
    res
      .status(200)
      .json({ success: true, message: "Approval request sent", jwtToken });
  } catch (error) {
    handleError(res, error);
  }
};

export const admitUserToRoom = async (req: CustomRequest, res: Response) => {
  try {
    const tokenData = req.user as TokenData;
    const { userId, userName } = req.body;

    const { room, user } = await validateRoomAndUser(
      tokenData.roomId,
      userName
    );

    const isOwner = (room.ownerId as Types.ObjectId).equals(
      new Types.ObjectId(tokenData.id)
    );
    const isRequested = (room.requestedMemberIds as Types.ObjectId[]).includes(
      userId as Types.ObjectId
    );

    if (!isOwner || !isRequested)
      throw new Error("Unauthorized to admit new members");

    await joinRoom(userId, tokenData.roomId);
    await updateExpireAtUserService(userId, room.expireAt);
    emitApprovalToUser(userId, userName, room, true, false);
    emitJoinedSyncToRoom(userId, userName, room.roomId, true, false);

    res
      .status(200)
      .json({ success: true, message: `${userName} joined the room` });
  } catch (error) {
    handleError(res, error);
  }
};

export const removeUserFromRoom = async (req: CustomRequest, res: Response) => {
  try {
    const tokenData = req.user as TokenData;
    const { userId, userName } = req.body;

    const { room } = await validateRoomAndUser(tokenData.roomId, userName);

    const isSelf = new Types.ObjectId(tokenData.id).equals(
      userId as Types.ObjectId
    );

    const isOwner = (room.ownerId as Types.ObjectId).equals(
      new Types.ObjectId(tokenData.id)
    );

    if ((room.ownerId as Types.ObjectId).equals(userId))
      throw new Error("Your are owner can't remove yourself");

    if (!(isOwner || isSelf))
      throw new Error("Unauthorized to remove a members/requestedMembers");

    logger.debug(userId);
    leaveRoom(userId, tokenData.roomId);
    emitApprovalToUser(userId, userName, room, false, false);
    emitJoinedSyncToRoom(userId, userName, room.roomId, false, false);

    res
      .status(200)
      .json({ success: true, message: `${userName} removed from the room` });
  } catch (error) {
    handleError(res, error);
  }
};

export const getMembersByRoomId = async (req: CustomRequest, res: Response) => {
  try {
    const tokenData = req.user as TokenData;

    const { room } = await validateRoomAndUser(
      tokenData.roomId,
      tokenData.userName
    );

    const isMember = (room.memberIds as Types.ObjectId[]).includes(
      new Types.ObjectId(tokenData.id)
    );

    if (!isMember)
      throw new Error("Unauthorized to get a members/requestedMembers list");

    const roomWithMembers = await getRoomMembers(tokenData.roomId);

    if (!roomWithMembers) {
      throw new Error(`RoomId ${tokenData.roomId} doesn't exits`);
    }

    // Combine memberIds (isMember: true) and requestedMemberIds (isMember: false)
    const joinedMembers: Member[] = [
      ...roomWithMembers.memberIds.map((member: any) => ({
        id: member.id.toString(),
        userName: member.userName,
        roomId: room.roomId,
        isMember: true,
        isOwner: room.ownerId.equals(member.id),
      })),
    ];
    const requestedMembers: Member[] = [
      ...roomWithMembers.requestedMemberIds.map((member: any) => ({
        id: member.id.toString(),
        userName: member.userName,
        roomId: room.roomId,
        isMember: false,
        isOwner: room.ownerId.equals(member.id),
      })),
    ];

    res.status(200).json({
      success: true,
      message: `members fetched for the roomId ${tokenData.roomId}`,
      payload: {
        requestedMembers,
        joinedMembers,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteRoom = async (req: CustomRequest, res: Response) => {
  try {
    const tokenData = req.user as TokenData;

    const { room } = await validateRoomAndUser(
      tokenData.roomId,
      tokenData.userName
    );

    const isOwner = (room.ownerId as Types.ObjectId).equals(
      new Types.ObjectId(tokenData.id)
    );

    if (!isOwner) throw new Error("Unauthorized to delete a room");

    await deleteAllChatsInRoom(room.roomId);
    await deleteRoomById(room.roomId);

    res.status(200).json({
      success: true,
      message: `All chat are deleted \n RoomId : ${room.roomId} deleted`,
    });
  } catch (error) {
    handleError(res, error);
  }
};
