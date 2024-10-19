"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRoutes = void 0;
const express_1 = __importDefault(require("express"));
const room_controller_1 = require("../controllers/room_controller");
exports.roomRoutes = express_1.default.Router();
exports.roomRoutes.route('/createRoom').post(room_controller_1.createRoom);
exports.roomRoutes.route('/joinroom').put(room_controller_1.joinRoom);
exports.roomRoutes.route('/getChat').post(room_controller_1.getChat);
exports.roomRoutes.route('/getUser').post(room_controller_1.getUser);
