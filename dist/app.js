"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const mongo_db_1 = require("./setups/mongo_db");
const cors_1 = __importDefault(require("cors"));
// import { socketServer } from './sockets';
const room_routes_1 = require("./routes/room_routes");
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const __dir = path_1.default.resolve();
const sslAuthFile = path_1.default.join(__dir, '/5DA733F0C07C144D802078B0FC9DEE0C.txt');
const key = fs_1.default.readFileSync('src/private.key');
const cert = fs_1.default.readFileSync('src/certificate.crt');
const cred = {
    key,
    cert
};
(0, dotenv_1.config)();
(0, mongo_db_1.dbConnect)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
const port = process.env.PORT || 5000;
// const httpsServer = createServer(app);
const httpsServer = https_1.default.createServer(cred, app);
const io = new socket_io_1.Server(httpsServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// socketServer(io);
app.use('/.well-known/pki-validation/5DA733F0C07C144D802078B0FC9DEE0C.txt', (req, res) => {
    res.sendFile(sslAuthFile);
});
app.use('/api/roomRoutes', room_routes_1.roomRoutes);
app.get('/', (req, res) => {
    console.log('oh hoo !');
    res.send('everything is ok');
});
httpsServer.listen(port, () => {
    console.log('Server is running on', port);
});
