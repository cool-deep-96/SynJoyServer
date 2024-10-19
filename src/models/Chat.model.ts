import mongoose, { models, Schema, Types, Document } from "mongoose";
import { IRoom } from "./Room.model";
import { IUser } from "./User.model";

export interface IChat extends Document {
    message: string;
    room: Types.ObjectId | IRoom;
    user: Types.ObjectId | IUser;
  }

const ChatSchema = new mongoose.Schema(
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
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    { timestamps: true }
);

export const Chat = models.Chat ||  mongoose.model("Chat", ChatSchema);
