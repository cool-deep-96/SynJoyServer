import { Server } from "socket.io";
import { Room } from "./models/Room.model";
import {
  JoinChannelMessage,
  JoinChannelResponse,
  MessageBox,
  MessageStatus,
} from "./common/interfaces";
import { validateCreateRoomPayload } from "./utils/validate";
import { getRoomService, joinRoomService } from "./services/room_service";
import { createUserService, getUserService } from "./services/user_service";
import { Types } from "mongoose";
import { IUser } from "./models/User.model";

const userSocketMap = new Map<Types.ObjectId, { socketId: string; roomId?: string }>();

const socketServer = (io: Server) => {
  //     var usersLive = 0;
  io.on("connection", (socket) => {
  //   socket.on(
  //     "join-channel",
  //     async (
  //       joinChannelMessage: JoinChannelMessage,
  //       callback: (
  //         error: { success: boolean; message: string } | null,
  //         response?: JoinChannelResponse | null
  //       ) => void
  //     ) => {
  //       try {
  //         // Validate the incoming message payload.
  //         validateCreateRoomPayload(joinChannelMessage as JoinChannelMessage);

  //         // Fetch the room using the roomId.
  //         const room = await getRoomService(joinChannelMessage.roomId);
  //         if (!room) {
  //           return callback(
  //             {
  //               success: false,
  //               message: `Room not found for roomId: ${joinChannelMessage.roomId}`,
  //             },
  //             null
  //           );
  //         }

  //         // Check if the user exists.
  //         let user = await getUserService(joinChannelMessage.userName);
  //         if (user) {
  //           // Validate user password.
  //           if (user.password !== joinChannelMessage.password) {
  //             return callback(
  //               { success: false, message: "Invalid password" },
  //               null
  //             );
  //           }

  //           // Check if the user is already a member of the room.
  //           const isUserJoined = (room.memberIds as Types.ObjectId[]).includes(
  //             user._id as Types.ObjectId
  //           );
  //           if (isUserJoined) {
  //             userSocketMap.set(joinChannelMessage.userName, {
  //               socketId: socket.id,
  //               roomId: joinChannelMessage.roomId,
  //             });
  //             return callback(null, {
  //               message: `${joinChannelMessage.userName} is already a member of the room.`,
  //               payload: {
  //                 _id: room._id as string,
  //                 roomId: room.roomId,
  //                 userName: joinChannelMessage.userName,
  //               },
  //             });
  //           }
  //         } else {
  //           // If user does not exist, request approval from the room owner.
  //           const ownerSocket = userSocketMap.get(
  //             (room.ownerId as IUser).userName
  //           );
  //           if (!ownerSocket) {
  //             throw new Error("Room owner is not available");
  //           }

  //           userSocketMap.set(joinChannelMessage.userName, {
  //             socketId: socket.id,
  //           });

  //           // Emit a request to the room owner for approval.
  //           io.to(ownerSocket.socketId).emit(
  //             "approve-join",
  //             joinChannelMessage.userName,
  //             async (error: Error | null, response: boolean) => {
  //               if (error || !response) {
  //                   console.log(error, response)
  //                 return callback(
  //                   { success: false, message: "Request declined" },
  //                   null
  //                 );
  //               } else if (response) {
  //                 // Create the user after receiving approval from the owner.
  //                 user = await createUserService(
  //                   joinChannelMessage.userName,
  //                   joinChannelMessage.password,
  //                   room.expireAt
  //                 );

  //                 // Add the user to the room.
  //                 await joinRoomService(
  //                   user._id as Types.ObjectId,
  //                   room.roomId
  //                 );

  //                 // Send a successful response to the client.
  //                 userSocketMap.set(joinChannelMessage.userName, {
  //                   socketId: socket.id,
  //                   roomId: joinChannelMessage.roomId,
  //                 });
  //                 callback(null, {
  //                   message: `${joinChannelMessage.userName} joined successfully.`,
  //                   payload: {
  //                     _id: room._id as string,
  //                     roomId: room.roomId,
  //                     userName: joinChannelMessage.userName,
  //                   },
  //                 });
  //               }
  //             }
  //           );
  //         }
  //       } catch (error) {
  //         callback(
  //           {
  //             success: false,
  //             message:
  //               error instanceof Error ? error.message : "Something went wrong",
  //           },
  //           null
  //         );
  //       }
  //     }
  //   );

    socket.on("video-sync-channel", () => {});

    socket.on("chat-sync-channel", () => {});

    //         usersLive++;
    //         io.emit('liveUsers', usersLive);

    //         socket.on('requestJoin', async (socketMessage: SocketMessage, callback) => {
    //             try {
    //                 const {roomId, userName} = socketMessage
    //                 const room = await Room.findOne({ room_id: roomId })
    //                 if (!room) {
    //                     throw new Error('Room Not Found');
    //                 } else {
    //                     const isUserJoined = room.userName.includes(userName);
    //                     if (isUserJoined) {
    //                         callback(null,
    //                             'true'
    //                         )
    //                     } else {
    //                         const ownerSocketId = userSocketMap.get(room.owner);
    //                         const socketId = socket.id
    //                         userSocketMap.set(userName, { socketId });
    //                         io.to(ownerSocketId!.socketId).emit('requestjoin', userName);
    //                         callback(null,
    //                             'status: pending'
    //                         )
    //                     }
    //                 }
    //             } catch (error) {
    //                 callback((error as Error).message || 'Something Went Wrong')
    //             }

    //         })

    //         socket.on('responsejoin', (socketMessage: SocketMessage, callback) => {
    //             try {
    //                 const {userName, roomId, accepted}= socketMessage
    //                 const userSocketId = userSocketMap.get(userName);
    //                 io.to(userSocketId?.socketId!).emit('responsejoin', userName, accepted);
    //                 if (!accepted) {
    //                     callback(null, 'Request Declined')
    //                 }
    //             } catch (error) {
    //                 callback((error as Error).message || 'Something Went Wrong')
    //             }
    //         })

    // socket.on('roomjoin', async (socketMessage: SocketMessage, callback) => {
    //     try {
    //         const {userName, roomId}= socketMessage
    //         const room = await Room.findOne({ room_id: roomId });
    //         if (!room) {
    //             throw new Error('Room Not Found');

    //         } else {
    //             const isUserJoined = room.userName.includes(userName);
    //             if (isUserJoined) {
    //                 socket.join(roomId!);
    //                 const socketId = socket.id;
    //                 userSocketMap.set(userName, { socketId, roomId });
    //                 const liveUsers = Array.from(userSocketMap.entries())
    //                 .filter(([_, { roomId }]) => roomId === roomId)
    //                 .map(([userName]) => userName);
    //                 io.to(roomId!).emit('notify', `${userName} Joined The Room `, [true, userName]);
    //                 io.to(roomId!).emit('liveusers', liveUsers)
    //             } else {
    //                 throw new Error('Request Again To Join ')
    //             }
    //         }
    //     } catch (error) {
    //         callback((error as Error).message || 'Something Went Wrong')
    //     }

    // });

    //         socket.on('pause', (socketMessage: SocketMessage) => {
    //             const {requestDuration, userName} = socketMessage
    //             const userSocketId = userSocketMap.get(userName);
    //             if(userSocketId?.roomId){
    //                 io.to(userSocketId.roomId).emit('pause',requestDuration,userName)
    //             }else{

    //             }
    //         });

    //         socket.on('videoId', (socketMessage: SocketMessage)=>{
    //             const {youtubeVideoId, userName} = socketMessage
    //             const userSocketId= userSocketMap.get(userName);
    //             if(userSocketId?.roomId){
    //                 io.to(userSocketId.roomId).emit('videoId', youtubeVideoId , userName);
    //             }
    //         });

    //         socket.on('play', (socketMessage: SocketMessage) => {
    //             const {requestDuration, userName}= socketMessage
    //             const userSocketId = userSocketMap.get(userName);
    //             if(userSocketId?.roomId){
    //                 io.to(userSocketId.roomId).emit('play', requestDuration, userName);
    //             }else{

    //             }
    //         });

    //         socket.on('roomMessage', async (data, callback) => {
    //             try {
    //                 const room = await Room.findOne({ room_id: data[1] });
    //                 if (!room) {
    //                     throw new Error('Room Not Found');

    //                 } else {
    //                     const isUserJoined = room.userName.includes(data[2]);
    //                     if (isUserJoined) {
    //                         await Room.updateOne({ room_id: data[1] },
    //                             {
    //                                 $push: {
    //                                     chat: {
    //                                         message: data[0],
    //                                         sentBy: data[2]
    //                                     }
    //                                 }
    //                             });
    //                         const messageBox: MessageBox = {
    //                             message: data[0],
    //                             sentBy: data[2],
    //                             status: MessageStatus.SENT
    //                         }
    //                         io.to(data[1]).emit('roomMessage', messageBox)
    //                         socket.emit('notify', 'message sent');
    //                     } else {
    //                         throw new Error('Request To Join');
    //                     }
    //                 }
    //             } catch (error) {
    //                 callback((error as Error).message || 'Something Went Wrong');
    //             }

    //         });

    socket.on("disconnect", () => {
      userSocketMap.forEach(({ socketId, roomId }, userName) => {
        if (socketId === socket.id) {
          userSocketMap.delete(userName);
          const liveUsers = Array.from(userSocketMap.entries())
            .filter(([_, { roomId }]) => roomId === roomId)
            .map(([userName]) => userName);

          if (roomId) {
            socket
              .to(roomId)
              .emit("notify", `${userName} is disconnected`, [false, userName]);
            io.to(roomId).emit("liveUsers", liveUsers);
          }
        }
      });
      //             usersLive--;
    });
  });
};

export { socketServer, userSocketMap };
