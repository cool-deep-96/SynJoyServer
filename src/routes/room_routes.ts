import express from "express";
import {
  admitUserToRoom,
  removeUserFromRoom,
  createRoomR,
  joinRoomR,
  requestJoinRoom,
  getMembersByRoomId,
  deleteRoom,
} from "../controllers/room_controller";
import { validateJwtToken } from "../utils/encryption/jwt";

export const roomRoutes = express.Router();

// Route definitions
roomRoutes.post("/", createRoomR);      // POST for room creation
roomRoutes.put("/join", requestJoinRoom);     // PUT for requesting to join room
roomRoutes.put("/attempt", validateJwtToken, joinRoomR);   // PUT for attempting to join room after validation
roomRoutes.put("/accept", validateJwtToken, admitUserToRoom);    // POST for retrieving members, could also use GET
roomRoutes.put("/reject", validateJwtToken, removeUserFromRoom);    // POST for retrieving members, could also use GET
roomRoutes.get("/members", validateJwtToken, getMembersByRoomId)
roomRoutes.delete('/', validateJwtToken, deleteRoom)