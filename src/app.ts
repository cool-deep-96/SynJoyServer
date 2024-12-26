import { createServer } from 'http';
import { Server } from "socket.io";
import { config } from 'dotenv';
import express, { Request, Response } from 'express';
import { dbConnect } from './setups/mongo_db';
import cors from 'cors';
import { roomRoutes } from './routes/room_routes';
import fs from 'fs';
import https from 'https';
import path from 'path';
import logger from './logging/logger';
import { socketServer } from '../sokets2';
import { tokenRoutes } from './routes/token_routes';
import { chatRoutes } from './routes/chat_routes';

const __dir = path.resolve()
const sslAuthFile = path.join(__dir, '/5DA733F0C07C144D802078B0FC9DEE0C.txt')
const key = fs.readFileSync('src/private.key');
const cert = fs.readFileSync('src/certificate.crt');

const cred = {
    key,
    cert
}


config();
dbConnect();

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.urlencoded(
    { extended: true }

))

const port = process.env.PORT || 5000;

const httpsServer = createServer(app);
// const httpsServer = https.createServer(cred, app);
export const io: Server = new Server(httpsServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

socketServer(io);

app.use('/.well-known/pki-validation/5DA733F0C07C144D802078B0FC9DEE0C.txt', (req, res) => {
    res.sendFile(sslAuthFile);
})

app.use('/api/room', roomRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req: Request, res: Response) => {

    //logger.info('ohooo ')
    res.send('everything is ok');
})












httpsServer.listen(port, () => {
    //logger.info(`Server is running on ${port}`);
})

