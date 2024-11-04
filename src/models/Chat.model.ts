import mongoose, { models, Schema, Types, Document, Date } from "mongoose";
import { IRoom } from "./Room.model";
import { IUser } from "./User.model";

export interface IChat extends Document {
    message: string;
    room: Types.ObjectId | IRoom;
    sentBy: Types.ObjectId | IUser;
    expireAt: Date
  }

const ChatSchema = new mongoose.Schema<IChat>(
    {
        message: {
            type: String,
            required: true,
        },
        room: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        sentBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expireAt: {
            type: Date,
            default: Date.now,
            index: { expires: 0 },
          },
    },
    { timestamps: true }
);

export const Chat = models.Chat ||  mongoose.model("Chat", ChatSchema);
