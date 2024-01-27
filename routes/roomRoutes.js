import express from 'express';
import bodyParser from 'body-parser';
import { createRoom, getChat, getUser, joinRoom } from '../controllers/roomController.js';

export const roomRoutes = express.Router();
const roomApp = express();

roomApp.use(bodyParser.json());
roomApp.use(bodyParser.urlencoded(
    {extended: true,}

))



roomRoutes.route('/createRoom').post(createRoom);
roomRoutes.route('/joinroom').put(joinRoom);
roomRoutes.route('/getChat').post(getChat);
roomRoutes.route('/getUser').post(getUser);





