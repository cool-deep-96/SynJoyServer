import express from 'express';

import { createRoom,  getUser, requestJoinRoom } from '../controllers/room_controller';

export const roomRoutes = express.Router();

roomRoutes.route('/createRoom').post(createRoom);
roomRoutes.route('/joinroom').put(requestJoinRoom);
// roomRoutes.route('/getChat').post(getChat);
roomRoutes.route('/getUser').post(getUser);





