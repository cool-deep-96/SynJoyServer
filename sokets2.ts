import { SycVideoPayload } from "./src/common/interfaces";
import { SOCKET_CHANNEL } from "./src/common/socket_channels";
import logger from "./src/logging/logger";
import { Server } from "socket.io";

export const userSocketMap = new Map<
  string,
  { socketId: string; roomId?: string }
>();

interface Payload {
  userId: string;
  userName: string;
  roomId: string;
}

export const socketServer = (io: Server) => {
  io.on("connection", (socket) => {
    //logger.info(`New client connected: ${socket.id}`);

    socket.on("register", (payload: Payload) => {
      userSocketMap.set(payload.userId, {
        socketId: socket.id,
        roomId: payload.roomId || undefined,
      });

      if (payload.roomId) {
        socket.join(payload.roomId);
      }

      //logger.info(
      //   `User registered: ${payload.userId} (socket ID: ${socket.id}) in room: ${payload.roomId}`
      // );
    });

    socket.on(SOCKET_CHANNEL.SYNC_VIDEO_CHANNEL, (payload: SycVideoPayload) => {
      if (payload.tokenData && payload.tokenData.isMember) {
        io.to(payload.tokenData.roomId).emit(
          SOCKET_CHANNEL.SYNC_VIDEO_CHANNEL,
          payload
        );
        //logger.info("syn-video-channel", {payload})
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      const userId = [...userSocketMap.entries()].find(
        ([, value]) => value.socketId === socket.id
      )?.[0];

      if (userId) {
        const roomId = userSocketMap.get(userId)?.roomId;
        userSocketMap.delete(userId);
        //logger.info(`User disconnected: ${userId}`);

        if (roomId) {
          // emitRemovalToRoom(userId, roomId);
          //logger.info(
          //   `User removed from room ${roomId}, and other users in the room are notified`
          // );
        }
      }

      //logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};
