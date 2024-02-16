import { Room } from "./models/roomModel.js";


const userSocketMap = new Map();


const socketServer = (io) => {
    var usersLive = 0;
    io.on("connection", (socket) => {

        usersLive++;
        io.emit('liveUsers', usersLive);

        socket.on('requestjoin', async (userName, room_id, callback) => {
            try {
                const room = await Room.findOne({ room_id: room_id })
                if (!room) {
                    throw new Error('Room Not Found');
                } else {
                    const isUserJoined = room.userName.includes(userName);
                    if (isUserJoined) {
                        callback(null,
                            'true'
                        );
                    } else {
                        const ownerSocketId = userSocketMap.get(room.owner);
                        const socketId = socket.id
                        userSocketMap.set(userName, { socketId, });
                        io.to(ownerSocketId?.socketId).emit('requestjoin', userName);
                        callback(null,
                            'status: pending'
                        );
                    }
                }
            } catch (error) {
                callback(error.message || 'Something Went Wrong')
            }

        })

        socket.on('responsejoin', (userName, room_id, accepted, callback) => {
            try {
                const userSocketId = userSocketMap.get(userName);
                io.to(userSocketId.socketId).emit('responsejoin', userName, accepted);
                if (!accepted) {
                    callback(null, 'Request Declined ')
                }
            } catch (error) {
                callback(error.message || 'Something Went Wrong')
            }
        })

        socket.on('roomjoin', async (room_id, userName, callback) => {
            try {

                const room = await Room.findOne({ room_id: room_id });
                if (!room) {
                    throw new Error('Room Not Found');

                } else {
                    const isUserJoined = room.userName.includes(userName);
                    if (isUserJoined) {
                        socket.join(room_id);
                        const socketId = socket.id;
                        userSocketMap.set(userName, { socketId, room_id });
                        const liveUsers = Array.from(userSocketMap.entries())
                        .filter(([_, { room_id }]) => room_id === room_id)
                        .map(([userName]) => userName);
                        io.to(room_id).emit('notify', `${userName} Joined The Room `, [true, userName]);
                        io.to(room_id).emit('liveusers', liveUsers)
                    } else {
                        throw new Error('Request Again To Join ')
                    }
                }
            } catch (error) {
                callback(error.message || 'Something Went Wrong')
            }

        });

        socket.on('pause', (second, userName) => {
            const userSocketId = userSocketMap.get(userName);
            if(userSocketId?.room_id){
                io.to(userSocketId.room_id).emit('pause',second,userName)
            }else{

            }
        });

        socket.on('videoId', (videoId, userName)=>{
            const userSocketId= userSocketMap.get(userName);
            if(userSocketId?.room_id){
                io.to(userSocketId.room_id).emit('videoId', videoId , userName);
            }
        });

        socket.on('play', (second, userName) => {
            const userSocketId = userSocketMap.get(userName);
            if(userSocketId?.room_id){
                io.to(userSocketId.room_id).emit('play', second, userName);
            }else{

            }
        });

        socket.on('roomMessage', async (data, callback) => {
            try {
                const room = await Room.findOne({ room_id: data[1] });
                if (!room) {
                    throw new Error('Room Not Found');

                } else {
                    const isUserJoined = room.userName.includes(data[2]);
                    if (isUserJoined) {
                        await Room.updateOne({ room_id: data[1] },
                            {
                                $push: {
                                    chat: {
                                        message: data[0],
                                        sentBy: data[2]
                                    }
                                }
                            });
                        io.to(data[1]).emit('roomMessage', { message: data[0], sentBy: data[2] })
                        socket.emit('notify', 'message sent');
                    } else {
                        throw new Error('Request To Join');
                    }
                }
            } catch (error) {
                callback(error.message || 'Something Went Wrong');
            }

        });

        socket.on('disconnect', () => {
            userSocketMap.forEach(({ socketId, room_id }, userName) => {
                if (socketId === socket.id) {
                    userSocketMap.delete(userName);
                    const liveUsers = Array.from(userSocketMap.entries())
                        .filter(([_, { room_id }]) => room_id === room_id)
                        .map(([userName]) => userName);

                    if (room_id) {
                        socket.to(room_id).emit('notify', `${userName} is diconnented`, [false, userName])
                        io.to(room_id).emit('liveusers', liveUsers)
                    }
                }
            });
            usersLive--;
            
        })
    })

}

export {
    socketServer,
    userSocketMap
}