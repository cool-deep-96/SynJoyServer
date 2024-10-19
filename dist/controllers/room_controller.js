"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.getChat = exports.roomChat = exports.joinRoom = exports.createRoom = void 0;
const room_model_1 = require("../models/room_model");
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { room_id, userName } = req.body;
        const newRoom = new room_model_1.Room({
            room_id: room_id,
            owner: userName,
            userName: [userName],
            expireAt: new Date(Date.now() + 24 * 3600 * 1000),
        });
        const room = yield newRoom.save();
        res.status(200).json({
            room,
            message: `Room '${room.room_id}' is created successfully`
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "Something Went Wrong"
        });
    }
});
exports.createRoom = createRoom;
const joinRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { room_id, userName } = req.body;
        const room = yield room_model_1.Room.findOne({ room_id: room_id });
        if (!room) {
            return res.status(400).json({
                message: "Room Not Found! Create a New One"
            });
        }
        else {
            const isUserJoined = room.userName.includes(userName);
            if (!isUserJoined) {
                yield room_model_1.Room.updateOne({ room_id: room_id }, {
                    $push: {
                        userName: userName
                    }
                });
            }
            res.status(200).json({
                userName: userName,
                room_id: room_id,
                message: `${userName} joined successfully`
            });
        }
    }
    catch (error) {
        res.status(400).json({
            message: "Something Went Wrong"
        });
    }
});
exports.joinRoom = joinRoom;
const roomChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { room_id, userName, message } = req.body;
        const room = yield room_model_1.Room.findOne({ room_id: room_id });
        if (!room) {
            return res.status(400).json({
                message: "Room Doesn't Exist , Create a New One"
            });
        }
        else {
            const isUserJoined = room.userName.includes(userName);
            if (isUserJoined) {
                yield room_model_1.Room.updateOne({ room_id: room_id }, {
                    $push: {
                        chat: {
                            message: message,
                            sentBy: userName
                        }
                    }
                });
                res.status(400).json({
                    message: 'message sent'
                });
            }
            else {
                return res.status(400).json({
                    message: 'Request To Join Room'
                });
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'Something Went Wrong'
        });
    }
});
exports.roomChat = roomChat;
const getChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { room_id, userName } = req.body;
        const room = yield room_model_1.Room.findOne({ room_id: room_id });
        if (!room) {
            return res.status(400).json({
                message: "Room Doesn't Exist , Create a New One"
            });
        }
        else {
            const isUserJoined = room.userName.includes(userName);
            if (isUserJoined) {
                res.status(200).json({
                    message: 'ok',
                    chat: room.chat
                });
            }
            else {
                return res.status(400).json({
                    message: 'Request To Join Room'
                });
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'Something Went Wrong'
        });
    }
});
exports.getChat = getChat;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { room_id, userName } = req.body;
        const room = yield room_model_1.Room.findOne({ room_id: room_id });
        if (!room) {
            return res.status(400).json({
                message: "Room Doesn't Exist , Create a New One"
            });
        }
        else {
            const isUserJoined = room.userName.includes(userName);
            if (isUserJoined) {
                return res.status(200).json({
                    message: 'ok',
                    userName: room.userName
                });
            }
            else {
                return res.status(400).json({
                    message: 'Request To Join Room'
                });
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'Something Went Wrong'
        });
    }
});
exports.getUser = getUser;
