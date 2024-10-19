import { Types } from "mongoose";
import { IRoom, Room } from "../models/Room.model";

export const getRoomService = async (roomId: string): Promise<IRoom | null> => {
  const roomDb = await Room.findOne({ roomId }).populate({
    path: "ownerId",
    select: ["userName", "_id"],
  });

  return roomDb || null;
};

export const createRoomService = async (
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
  const room = await newRoom.save();
  return room;
};

export const joinRoomService = async (
  memberId: Types.ObjectId,
  roomId: string
): Promise<void> => {
  await Room.findOneAndUpdate(
    { roomId },
    {
      $push: {
        memberIds: memberId,
      },
    }
  );
};

export const requestRoomService = async (
  memberId: Types.ObjectId,
  roomId: string
): Promise<void> => {
  await Room.findOneAndUpdate(
    { roomId },
    {
      $push: {
        requestedMemberIds: memberId,
      },
    }
  );
};

export const leaveRoomService = async (
  memberId: Types.ObjectId,
  roomId: string
): Promise<void> => {
  await Room.findOneAndUpdate(
    { roomId },
    {
      $pop: {
        memberIds: memberId,
      },
    }
  );
};

export const getMembersOfRoom = async (
  roomId: string
): Promise<IRoom | null> => {
  const roomDb = await Room.findOne({ roomId })
    .populate({
      path: "memberIds",
      select: ["userName", "_id"],
    })
    .populate({
      path: "requestedMemberIds",
      select: ["userName", "_id"],
    });
  return roomDb || null;
};

export const getRequestedMembersOfRoom = async (
  roomId: string
): Promise<IRoom | null> => {
  const roomDb = await Room.findOne({ roomId }).populate({
    path: "requestedMemberIds",
    select: ["userName", "_id"],
  });
  return roomDb || null;
};
