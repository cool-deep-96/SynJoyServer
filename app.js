import {createServer} from 'http';
import { Server } from "socket.io";
import { config } from 'dotenv';
import  express  from 'express';
import {connect} from './setups/mongoDB.js';
import cors from 'cors';
import { socketServer } from './sockets.js';
import { roomRoutes } from './routes/roomRoutes.js';
import fs from 'fs';
import https from 'https';
import path from 'path';

const __dir = path.resolve()
const sslAuthFile = path.join(__dir, '/5DA733F0C07C144D802078B0FC9DEE0C.txt')
// const key = fs.readFileSync('private.key');
// const cert = fs.readFileSync('certificate.crt');

// const cred = {
//     key,
//     cert
// }


config();
connect();

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.urlencoded(
    {extended: true}

))

const port= process.env.PORT || 5000;

const httpsServer = createServer(app);
const io = new Server(httpsServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

socketServer(io);

app.use('/.well-known/pki-validation/5DA733F0C07C144D802078B0FC9DEE0C.txt', (req, res) => {
    res.sendFile(sslAuthFile);
})

app.use('/api/roomRoutes', roomRoutes);

app.get('/',(req, res)=>{
    console.log('oh hoo !')
    res.send('everything is ok');
})












httpsServer.listen(port, () => {
    console.log('Server is running on' , port );
})

