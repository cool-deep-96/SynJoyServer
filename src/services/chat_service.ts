import { Date, Types } from "mongoose";
import { Chat } from "../models/Chat.model";
import { IChat } from "../models/Chat.model";

/**
 * Create a new chat message.
 * @param message - The content of the message.
 * @param roomId - The ObjectId of the room.
 * @param userId - The ObjectId of the user sending the message.
 * @param expireAt - The expiration date of the message.
 * @returns The created chat document.
 */
export const createChat = async (
  message: string,
  roomId: Types.ObjectId,
  userId: Types.ObjectId,
  expireAt: Date
): Promise<IChat> => {
  const newChat: IChat = new Chat({
    message,
    room: roomId,
    sentBy: userId,
    expireAt,
  });
  await newChat.save()
  return newChat
};

/**
 * Get all chats in a specific room.
 * @param roomId - The ObjectId of the room.
 * @returns Array of chat documents in the specified room.
 */
export const getChatsByRoom = async (
  roomId: Types.ObjectId
): Promise<IChat[]> => {
  return await Chat.find({ room: roomId }).populate("room").populate("sentBy");
};

/**
 * Get a single chat by its ID.
 * @param messageId - The ObjectId of the message.
 * @returns The chat document if found.
 */
export const getChatById = async (
  messageId: Types.ObjectId
): Promise<IChat | null> => {
  return await Chat.findById(messageId).populate("room").populate("sentBy");
};

/**
 * Update a chat message.
 * @param messageId - The ObjectId of the message to update.
 * @param updatedMessage - The new message content.
 * @returns The updated chat document if found.
 */
export const updateChat = async (
  messageId: Types.ObjectId,
  updatedMessage: string
): Promise<IChat | null> => {
  return await Chat.findByIdAndUpdate(
    messageId,
    { message: updatedMessage },
    { new: true }
  );
};

/**
 * Delete a chat message.
 * @param messageId - The ObjectId of the message to delete.
 * @returns The deleted chat document if found.
 */
export const deleteChat = async (
  messageId: Types.ObjectId
): Promise<IChat | null> => {
  return await Chat.findByIdAndDelete(messageId);
};

/**
 * Delete all chats in a specific room.
 * @param roomId - The ObjectId of the room.
 * @returns A success message upon deletion.
 */
export const deleteAllChatsInRoom = async (
  roomId: string
): Promise<{ message: string }> => {
  await Chat.deleteMany({ room: roomId });
  return { message: "All chats in the room have been deleted." };
};
