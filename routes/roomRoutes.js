import express from 'express';

import { createRoom, getChat, getUser, joinRoom } from '../controllers/roomController.js';

export const roomRoutes = express.Router();






roomRoutes.route('/createRoom').post(createRoom);
roomRoutes.route('/joinroom').put(joinRoom);
roomRoutes.route('/getChat').post(getChat);
roomRoutes.route('/getUser').post(getUser);





