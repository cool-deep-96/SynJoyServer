import { SocketMessage } from "../common/interfaces";
import { Room } from "../models/Room.model";
import { userSocketMap } from "../sockets";

const joiningRequest = async (socketMessage: SocketMessage, callback) => {
    try {
        const {roomId, userName} = socketMessage
        const room = await Room.findOne({ roomid: roomId })
        if (!room) {
            throw new Error('Room Not Found');
        } else {
            const isUserJoined = room.userName.includes(userName);
            if (isUserJoined) {
                callback(null,
                    'true'
                )
            } else {
                const ownerSocketId = userSocketMap.get(room.owner);
                const socketId = socket.id
                userSocketMap.set(userName, { socketId });
                io.to(ownerSocketId!.socketId).emit('requestjoin', userName);
                callback(null,
                    'status: pending'
                )
            }
        }
    } catch (error) {
        callback((error as Error).message || 'Something Went Wrong')
    }

}