"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const RoomSchema = new mongoose_1.default.Schema({
    room_id: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: String
    },
    userName: [{ type: String }],
    chat: [{
            message: {
                type: String
            },
            sentBy: {
                type: String
            }
        }],
    expireAt: { type: Date, default: Date.now, index: { expires: 0 } },
}, { timestamps: true });
exports.Room = mongoose_1.default.model("Room", RoomSchema);
