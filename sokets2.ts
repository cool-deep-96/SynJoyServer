import { Types } from "mongoose";
import { io } from "./src/app";
import { getRoomService, joinRoomService } from "./src/services/room_service";

export const userSocketMap = new Map<Types.ObjectId, { socketId: string; roomId?: string }>();

io.on("connection", (socket) => {
  // Listen for approval from the room owner.

  socket.on('approve-join-channel', () => {
    
  })

  socket.on(
    "join-approval-channel",
    async ({ userName, userId, roomId, isApproved, ownerId }, callback) => {
      try {
        console.log("hoo")
        const room = await getRoomService(roomId);
        if (!room) {
          return callback(
            { success: false, message: `Room not found for roomId: ${roomId}` },
            null
          );
        }

        if (room.ownerId !== ownerId) {
          return callback(
            { success: false, message: `Room not found for roomId: ${roomId}` },
            null
          );
        }

        const userSocketInfo = userSocketMap.get(userId);

        if (isApproved) {
          // Add user to the room.
          await joinRoomService(userId, room.roomId);
          if (!userSocketInfo) {
            return callback(
              { success: false, message: "User is not available for approval" },
              null
            );
          }

          // Notify the user that their request was approved.
          io.to(userSocketInfo.socketId).emit("join-approval-channel", {
            success: true,
            message: `${userName} joined successfully.`,
            payload: {
              _id: room._id,
              roomId: room.roomId,
              userName: userName,
            },
          });
        } else {
          if (!userSocketInfo) {
            return callback(
              { success: false, message: "User is not available for approval" },
              null
            );
          }
          // Notify the user that their request was declined.
          io.to(userSocketInfo.socketId).emit("join-approval-channel", {
            success: false,
            message: "Request was declined.",
          });
        }

        // Remove the temporary socket mapping.
        userSocketMap.delete(userName);

        callback(null, {
          success: true,
          message: "Approval processed successfully",
        });
      } catch (error) {
        callback(
          {
            success: false,
            message: "An error occurred during approval processing",
          },
          null
        );
      }
    }
  );
});
