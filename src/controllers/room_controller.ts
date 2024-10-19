import { Request, Response } from "express";
import {
  createRoomService,
  getMembersOfRoom,
  getRoomService,
  joinRoomService,
  requestRoomService,
} from "../services/room_service";
import { createUserService, getUserService, updateExpireAtUserService } from "../services/user_service";
import { Types } from "mongoose";
import { validateCreateRoomPayload } from "../utils/validate";
import { CreateRoomPayload, JoinRoomPayload } from "../common/interfaces";
import { userSocketMap } from "../sockets";
import { io } from "../app";
import logger from "../logging/logger";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { createRoomPayload } = req.body;
    validateCreateRoomPayload(createRoomPayload as CreateRoomPayload);

    const isRoomExist = await getRoomService(createRoomPayload.roomId);
    if (isRoomExist) {
      throw new Error(`roomId already exist: ${createRoomPayload.roomId}`);
    }

    const isUserExist = await getUserService(createRoomPayload.userName);
    if (isUserExist) {
      throw new Error(`userName already exist: ${createRoomPayload.userName}`);
    }

    const user = await createUserService(
      createRoomPayload.userName,
      createRoomPayload.password
    );

    const room = await createRoomService(
      createRoomPayload.roomId,
      user._id as Types.ObjectId,
      user.expireAt
    );

    const payload = {
      _id: room._id,
      roomId: createRoomPayload.roomId,
      userName: createRoomPayload.userName,
      password: user.password,
    };

    logger.info("Room created successfully", { payload });
    res.status(200).json({
      success: true,
      payload,
      message: `Room '${room.roomId}' is created successfully`,
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};

export const requestJoinRoom = async (req: Request, res: Response) => {
  try {
    const { joinRoomPayload } = req.body;
    validateCreateRoomPayload(joinRoomPayload as JoinRoomPayload);

    const room = await getRoomService(joinRoomPayload.roomId);
    if (!room) {
      throw new Error(`Room not found for roomId: ${joinRoomPayload.roomId}`);
    }

    let user = await getUserService(joinRoomPayload.userName);
    if (user) {
      if (user.password !== joinRoomPayload.password) {
        throw new Error(
          `Invalid password for userName: ${joinRoomPayload.userName}`
        );
      }

      const isUserJoined = (room.memberIds as Types.ObjectId[]).includes(
        user._id as Types.ObjectId
      );
      if (isUserJoined) {
        const payload = {
          _id: user._id,
          roomId: room.roomId,
          userName: joinRoomPayload.userName,
          password: user.password,
        };
        logger.info(
          `${joinRoomPayload.userName} is already a member of the room.`,
          { payload }
        );
        return res.status(200).json({
          success: true,
          message: `${joinRoomPayload.userName} is already a member of the room.`,
          payload,
        });
      }
    } else {
      user = await createUserService(
        joinRoomPayload.userName,
        joinRoomPayload.password,
        room.expireAt
      );
      await requestRoomService(user._id as Types.ObjectId, room.roomId);
    }

    // Emit approval request to the room owner.
    const ownerSocket = userSocketMap.get(room.ownerId as Types.ObjectId);
    if (ownerSocket) {
      const payload = {
        _id: user._id,
        userName: user.userName,
        roomId: room.roomId,
      };
      logger.info("Emit approval request to the room owner", payload);
      io.to(ownerSocket.socketId).emit("join-request-channel", payload);
    }
    const payload = {
      _id: user._id,
      userName: user.userName,
      password: user.password,
      roomId: room.roomId,
    };
    logger.info("Request to join room processed", payload);
    return res.status(200).json({
      success: true,
      message: "Approval request sent to room owner. Please wait for approval.",
      payload,
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};

export const admitRoom = async (req: Request, res: Response) => {
  try {
    const { joinRoomPayload, userId } = req.body;
    validateCreateRoomPayload(joinRoomPayload as JoinRoomPayload);

    const room = await getRoomService(joinRoomPayload.roomId);
    if (!room) {
      throw new Error(`Room not found for roomId: ${joinRoomPayload.roomId}`);
    }

    let user = await getUserService(joinRoomPayload.userName);
    if (user) {
      if (user.password !== joinRoomPayload.password) {
        throw new Error(
          `Invalid password for userName: ${joinRoomPayload.userName}`
        );
      }

      const isOwner = (room.ownerId as Types.ObjectId).equals(
        joinRoomPayload._id as Types.ObjectId
      );
      if (isOwner) {
        await joinRoomService(userId, joinRoomPayload.roomId)
        await updateExpireAtUserService(userId, room.expireAt)
        const payload = {
          _id: user._id,
          roomId: room.roomId,
          userName: joinRoomPayload.userName,
        };
        logger.info(
          `${joinRoomPayload.userName} is joined as member of the room.`,
          { payload }
        );
        return res.status(200).json({
          success: true,
          message: `${joinRoomPayload.userName} is joined as member of the room.`,
          payload,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `Your are not authorized to admit new member to roomId: ${joinRoomPayload.roomId}.`,
      });
    }

    // Emit approval request to the room owner.
    const ownerSocket = userSocketMap.get(room.ownerId as Types.ObjectId);
    if (ownerSocket) {
      const payload = {
        _id: user._id,
        userName: user.userName,
        roomId: room.roomId,
      };
      logger.info("Emit approval request to the room owner", payload);
      io.to(ownerSocket.socketId).emit("join-request-channel", payload);
    }
    const payload = {
      _id: user._id,
      userName: user.userName,
      password: user.password,
      roomId: room.roomId,
    };
    logger.info("Request to join room processed", payload);
    return res.status(200).json({
      success: true,
      message: "Approval request sent to room owner. Please wait for approval.",
      payload,
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { roomId, userName } = req.body;
    const room = await getRoomService(roomId);
    if (!room) {
      throw new Error(`Room not found for roomId: ${roomId}`);
    }
    const user = await getUserService(userName);
    if (user) {
      const isUserJoined = (room.memberIds as Types.ObjectId[]).includes(
        user._id as Types.ObjectId
      );
      if (isUserJoined) {
        const room = await getMembersOfRoom(roomId);
        const payload = {
          members: room?.memberIds || [],
          requestedMembers: room?.requestedMemberIds || [],
        };
        logger.info(`Members sent to userName: ${user}`);
        return res.status(200).json({
          success: true,
          message: `users fetched successfully`,
          payload,
        });
      } else {
        throw new Error(`Not a member of roomId: ${roomId}, Request to Join`);
      }
    } else {
      throw new Error("userName does not exist");
    }
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};
