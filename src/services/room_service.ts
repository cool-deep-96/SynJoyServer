import { Date, Types } from "mongoose";
import { IRoom, Room } from "../models/Room.model";

/**
 * Retrieve a room by its roomId.
 * @param roomId - The unique room identifier.
 * @returns The room document if found.
 */
export const getRoomById = async (roomId: string): Promise<IRoom | null> => {
  const room = await Room.findOne({ roomId }).populate({
    path: "ownerId",
    select: ["userName"],
  });
  return room || null;
};

/**
 * Create a new room.
 * @param roomId - The unique room identifier.
 * @param ownerId - The ObjectId of the user creating the room.
 * @param expireAt - The expiration date for the room.
 * @returns The created room document.
 */
export const createRoom = async (
  roomId: string,
  ownerId: Types.ObjectId,
  expireAt: Date
): Promise<IRoom> => {
  const newRoom = new Room({
    roomId,
    ownerId,
    memberIds: [ownerId],
    expireAt,
  });
  await newRoom.save();
  return newRoom
};

/**
 * Join a room by adding a member to the room.
 * @param memberId - The ObjectId of the user joining the room.
 * @param roomId - The unique room identifier.
 * @returns The updated room document.
 */
export const joinRoom = async (
  memberId: Types.ObjectId,
  roomId: string
): Promise<IRoom | null> => {
  return await Room.findOneAndUpdate(
    { roomId },
    {
      $addToSet: { memberIds: memberId },
      $pull: { requestedMemberIds: memberId },
    },
    { new: true }
  );
};

/**
 * Request to join a room by adding the member to requestedMemberIds.
 * @param memberId - The ObjectId of the user requesting to join.
 * @param roomId - The unique room identifier.
 * @returns The updated room document.
 */
export const requestToJoinRoom = async (
  memberId: Types.ObjectId,
  roomId: string
): Promise<IRoom | null> => {
  return await Room.findOneAndUpdate(
    { roomId },
    {
      $addToSet: { requestedMemberIds: memberId },
    },
    { new: true }
  );
};

/**
 * Leave a room by removing the member from memberIds.
 * @param memberId - The ObjectId of the user leaving the room.
 * @param roomId - The unique room identifier.
 * @returns The updated room document.
 */
export const leaveRoom = async (
  memberId: Types.ObjectId,
  roomId: string
): Promise<IRoom | null> => {
  return await Room.findOneAndUpdate(
    { roomId },
    {
      $pull: { memberIds: memberId, requestedMemberIds: memberId },
    },
    { new: true }
  );
};

/**
 * Get all members of a room.
 * @param roomId - The unique room identifier.
 * @returns The room document with populated members.
 */
export const getRoomMembers = async (roomId: string): Promise<IRoom | null> => {
  return await Room.findOne({ roomId })
    .populate({ path: "memberIds", select: ["userName"] })
    .populate({ path: "requestedMemberIds", select: ["userName"] });
};

/**
 * Get all requested members of a room.
 * @param roomId - The unique room identifier.
 * @returns The room document with populated requested members.
 */
export const getRequestedRoomMembers = async (
  roomId: string
): Promise<IRoom | null> => {
  return await Room.findOne({ roomId }).populate({
    path: "requestedMemberIds",
    select: ["userName"],
  });
};

/**
 * Delete a room by its roomId and cascade delete its associated chats.
 * @param roomId - The unique room identifier.
 * @returns The deleted room document if found.
 */
export const deleteRoomById = async (roomId: string): Promise<IRoom | null> => {
  return await Room.findOneAndDelete({ roomId });
};

/**
 * Push a messageId to the room's messageIds array.
 * @param roomId - The unique room identifier.
 * @param messageId - The ObjectId of the chat message to add.
 * @returns The updated room document with the new messageId added.
 */
export const pushMessageId = async (
  roomId: string,
  messageId: Types.ObjectId
): Promise<IRoom | null> => {
  return await Room.findOneAndUpdate(
    { roomId },
    { $push: { messageIds: messageId } },
    { new: true }
  );
};

/**
 * Pull (remove) a messageId from the room's messageIds array.
 * @param roomId - The unique room identifier.
 * @param messageId - The ObjectId of the chat message to remove.
 * @returns The updated room document with the messageId removed.
 */
export const pullMessageId = async (
  roomId: string,
  messageId: Types.ObjectId
): Promise<IRoom | null> => {
  return await Room.findOneAndUpdate(
    { roomId },
    { $pull: { messageIds: messageId } },
    { new: true }
  );
};
