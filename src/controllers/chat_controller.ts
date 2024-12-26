import { Request, Response } from "express";
import { Types } from "mongoose";
import { CustomRequest, Message, TokenData } from "../common/interfaces";
import {
  createChat,
  deleteChat,
  getChatById,
  getChatsByRoom,
  updateChat,
} from "../services/chat_service";
import {
  getRoomById,
  pullMessageId,
  pushMessageId,
} from "../services/room_service";
import logger from "../logging/logger";
import { emitChatSyncToRoom } from "../utils/room_controller/room_controller";
import { IUser } from "../models/User.model";

// Create a new chat message
export const createChatController = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { message } = req.body;
    const user = req.user as TokenData;

    if (!user || !user.isMember) {
      throw new Error("User not approved to send messages.");
    }

    const room = await getRoomById(user.roomId);
    if (!room) {
      throw new Error("Room not found.");
    }

    const isMember = (room.memberIds as Types.ObjectId[]).includes(
      new Types.ObjectId(user.id)
    );
    if (!isMember) {
      throw new Error("User is not a member of this room.");
    }

    const newChat = await createChat(
      message,
      room.id,
      new Types.ObjectId(user.id),
      user.expireAt
    );

    await pushMessageId(user.roomId, newChat.id);

    //logger.info(
    //   `Chat created successfully for room: ${user.roomId}, by user: ${user.userName}`
    // );

    emitChatSyncToRoom(
      newChat.id,
      user.id,
      user.userName,
      newChat.message,
      newChat.createdAt.toString(),
      false,
      room.roomId
    );

    return res.status(201).json({
      success: true,
      message: "Chat created successfully.",
      data: {
        id: newChat.id,
        sentById: user.id,
        sentByUserName: user.userName,
        text: newChat.message,
        time: 0,
        isRemoved: false,
      },
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};

// Delete a chat message
export const deleteChatController = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { messageId } = req.params;
    const user = req.user as TokenData;

    if (!user) {
      throw new Error("Unauthorized access.");
    }

    const room = await getRoomById(user.roomId);
    if (!room) {
      throw new Error("Room not found.");
    }

    const isMember = (room.memberIds as Types.ObjectId[]).includes(
      new Types.ObjectId(user.id)
    );
    if (!isMember) {
      throw new Error("User is not a member of this room.");
    }

    const chatDb = await getChatById(new Types.ObjectId(messageId));
    if (!chatDb) {
      throw new Error(`Message not found for messageId: ${messageId}`);
    }
    const isOwner = (room.ownerId as Types.ObjectId).equals(
      new Types.ObjectId(user.id)
    );
    const isSender = ((chatDb.sentBy as IUser)._id as Types.ObjectId).equals(
      user.id
    );
    if (!isSender && !isOwner) {
      throw new Error("You can't delete other users' messages.");
    }

    await deleteChat(new Types.ObjectId(messageId));
    await pullMessageId(user.roomId, new Types.ObjectId(messageId));

    //logger.info(
    //   `Chat message with ID: ${messageId} deleted by user: ${user.userName}`
    // );

    emitChatSyncToRoom(
      chatDb.id,
      chatDb.sentBy.id,
      (chatDb.sentBy as IUser).userName,
      chatDb.message,
      chatDb.createdAt.toString(),
      true,
      room.roomId
    );

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};

// Get chats by room ID
export const getChatByRoomIdController = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const user = req.user as TokenData;

    if (!user) {
      throw new Error("User not approved to view chats.");
    }

    const room = await getRoomById(user.roomId);
    if (!room) {
      throw new Error("Room not found.");
    }

    const isMember = (room.memberIds as Types.ObjectId[]).includes(
      new Types.ObjectId(user.id)
    );
    if (!isMember) {
      throw new Error("User is not a member of this room.");
    }
    const chats = await getChatsByRoom(room.id);

    //logger.info(
    //   `Chats retrieved successfully for room: ${user.roomId} by user: ${user.userName}`,
    //   chats
    // );

    const data: Message[] = chats.map((chat) => ({
      id: chat.id,
      sentById: chat.sentBy.id,
      sentByUserName: (chat.sentBy as IUser).userName,
      text: chat.message,
      time: chat.createdAt.toString(),
      isRemoved: false,
    }));

    return res.status(200).json({
      success: true,
      message: "Chats retrieved successfully.",
      data,
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};

export const updateChatController = async (
  req: CustomRequest,
  res: Response
) => {
  try {
    const { messageId } = req.params;
    const { updatedMessage } = req.body;
    const user = req.user as TokenData;

    if (!user) {
      throw new Error("Unauthorized access.");
    }

    const room = await getRoomById(user.roomId);
    if (!room) {
      throw new Error("Room not found.");
    }

    const isMember = (room.memberIds as Types.ObjectId[]).includes(
      new Types.ObjectId(user.id)
    );
    if (!isMember) {
      throw new Error("User is not a member of this room.");
    }

    const chatDb = await getChatById(new Types.ObjectId(messageId));
    if (!chatDb) {
      throw new Error(`Message not found for messageId: ${messageId}`);
    }
    logger.error("chat db ", chatDb.sentBy);
    const isSender = ((chatDb.sentBy as IUser)._id as Types.ObjectId).equals(
      user.id
    );
    if (!isSender) {
      throw new Error("You cannot update messages sent by others.");
    }

    const updatedChat = await updateChat(
      new Types.ObjectId(messageId),
      updatedMessage
    );

    if (!updatedChat) {
      throw new Error("Failed to update chat message.");
    }

    //logger.info(
    //   `Chat message with ID: ${messageId} updated by user: ${user.userName}`
    // );
    const data: Message = {
      id: updatedChat.id,
      sentById: chatDb.sentBy.id,
      sentByUserName: (chatDb.sentBy as IUser).userName,
      text: updatedChat.message,
      time: updatedChat.createdAt.toString(),
      isRemoved: false,
    };
    emitChatSyncToRoom(
      data.id,
      data.sentById,
      data.sentByUserName,
      data.text,
      data.time.toString(),
      false,
      user.roomId
    )

    return res.status(200).json({
      success: true,
      message: "Chat updated successfully.",
      data: data,
    });
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : "Something Went Wrong"
    );
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Something Went Wrong",
    });
  }
};
