import mongoose from "mongoose";

const RoomSchema =new  mongoose.Schema(
    {
        room_id: {
            type:String,
            required: true,
            unique: true
        },
        owner: {
            type:String
        },
        userName:[{type: String}]
        ,
        chat:[{
            message:{
                type: String
            },
            sentBy:{
                type: String
            }
        }],
        expireAt: { type: Date, default: Date.now, index: { expires: 0 } },
    },
    {timestamps: true}
);

export const Room= mongoose.model("Room", RoomSchema);


