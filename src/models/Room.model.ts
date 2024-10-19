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
        ref: 'User'
      }
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

// Pre middleware to handle cascading deletes when using findOneAndDelete or findByIdAndDelete
RoomSchema.pre("findOneAndDelete", async function (next) {
  try {
    const room = await this.model.findOne(this.getFilter());
    if (room) {
      await Chat.deleteMany({ _id: { $in: room.chat } });
      await User.deleteMany({ _id: { $in: room.userName } });
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Optional: Pre middleware for document-based remove
// RoomSchema.pre("remove", async function (next) {
//   try {
//     await Chat.deleteMany({ _id: { $in: this.chat } });
//     await User.deleteMany({ _id: { $in: this.userName } });
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
