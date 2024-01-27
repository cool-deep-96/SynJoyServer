import { Room }from '../models/roomModel.js';

export const createRoom = async (req, res) =>{
    try{
        const {room_id, userName} = req.body;
        const newRoom = new Room({
            room_id: room_id,
            owner: userName,
            userName: [userName],
            expireAt: new Date(Date.now() + 24 * 3600 * 1000), 
        });

        const room = await newRoom.save();
        res.status(200).json({
            room,
            message: `Room '${room.room_id}' is created successfully`
        })

    } catch (error){
        res.status(400).json(
            {
                success: false,
                message: "Something Went Wrong"
            }
        )

    }
}


export const joinRoom = async (req, res)=>{
    try{
        
        const {room_id, userName} = req.body;
        const room = await Room.findOne({room_id: room_id});
        if(!room){
            return res.status(400).json({
                message: "Room Not Found! Create a New One"
            })
        } else {
            const isUserJoined = room.userName.includes(userName);
            if(!isUserJoined){
                await Room.updateOne({room_id:room_id},
                    {
                        $push: {
                            userName: userName
                        }
                    });
            }
            res.status(200).json({
                userName: userName,
                room_id: room_id,
                message: `${userName} joined successfully`
            })
        }

    } catch (error){
        res.status(400).json({
            message: "Something Went Wrong"
        })

    }
}

export const roomChat = async (req, res)=>{
    try{
        const {room_id, userName, message } = req.body;
        const room = findOne({room_id: room_id});
        if(!room){
            return res.status(400).json({
                message: "Room Doesn't Exist , Create a New One"
            })
        } else {
            const isUserJoined = room.userName.includes(userName);
            if(isUserJoined){
                await Room.updateOne({room_id:room_id},
                    {
                        $push: {
                            chat:{
                                message: message,
                                sentBy: userName
                            }
                        }
                    });
    
                res.status(400).json({
                    message: 'message sent'
                })
            } else{
                return res.status(400).json({
                    message: 'Request To Join Room'
                })
            }

            

        }

    } catch (error){
        res.status(400).json({
            message:  'Something Went Wrong'
        })
    }
}

export const getChat = async (req, res) =>{
    try{
        const { room_id, userName } = req.body;
        const room = await Room.findOne({room_id: room_id});
        if(!room){
            return res.status(400).json({
                message: "Room Doesn't Exist , Create a New One"
            })
        } else {
            const isUserJoined = room.userName.includes(userName);
            if(isUserJoined){
                res.status(200).json({
                    message: 'ok',
                    chat: room.chat
                })
            } else{
                return res.status(400).json({
                    message: 'Request To Join Room'
                })
            }
        }

    } catch (error) {
        res.status(400).json({
            message:  'Something Went Wrong'
        })
    }
}

export const getUser = async (req, res) =>{
    try{
        const {room_id, userName} = req.body;
        const room = await Room.findOne({room_id: room_id});
        if(!room){
            return res.status(400).json({
                message: "Room Doesn't Exist , Create a New One"
            })
        } else {
            const isUserJoined = room.userName.includes(userName);
            if(isUserJoined){
               return  res.status(200).json({
                    message: 'ok',
                    userName: room.userName
                })
            } else{
                return res.status(400).json({
                    message: 'Request To Join Room'
                })

            }
        }

    } catch (error) {
        res.status(400).json({
            message:  'Something Went Wrong'
        })
    }
}




