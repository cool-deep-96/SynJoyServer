import mongoose, { Document, Schema } from "mongoose";
import User, { IUser } from "./User.model";
import { Chat, IChat } from "./Chat.model";
import { Types } from "mongoose";

export interface IRoom extends Document {
  roomId: string;
  ownerId: Types.ObjectId | IUser;
  memberIds: Types.ObjectId[] | IUser[];
  requestedMemberIds: Types.ObjectId[] | IUser[];
  chatIds: Types.ObjectId[] | IChat[];
  expireAt: Date;
}

const RoomSchema = new mongoose.Schema<IRoom>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    requestedMemberIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    expireAt: {
      type: Date,
      default: Date.now,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// Cascade delete related chats when the room is deleted
RoomSchema.pre("findOneAndDelete", async function (next) {
  const room = await this.model.findOne(this.getFilter());
  if (room) {
    await Chat.deleteMany({ room: room._id });
  }
  next();
});

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
