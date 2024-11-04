import express from "express";
import { validateJwtToken } from "../utils/encryption/jwt";
import {
  createChatController,
  deleteChatController,
  getChatByRoomIdController,
  updateChatController,
} from "../controllers/chat_controller";

export const chatRoutes = express.Router();

chatRoutes.route("/").get(validateJwtToken, getChatByRoomIdController);
chatRoutes.route("/").post(validateJwtToken, createChatController);
chatRoutes.route("/:messageId").delete(validateJwtToken, deleteChatController);
chatRoutes.route("/:messageId").patch(validateJwtToken, updateChatController);
