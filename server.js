import {createServer} from 'http';
import { Server } from "socket.io";
import { config } from 'dotenv';
import  express  from 'express';
import {connect} from './setups/mongoDB.js';
import cors from 'cors';
import { socketServer } from './sockets.js';
import { roomRoutes } from './routes/roomRoutes.js';

config();
connect();

const app = express();
app.use(express.json());
app.use(cors());

const port= process.env.PORT || 5000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

socketServer(io);



app.use('/api/roomRoutes', roomRoutes);





httpServer.listen(port, () => {
    console.log('Server is running on' , port );
})

