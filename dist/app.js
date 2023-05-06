"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const helper_1 = require("./helper");
const app = (0, express_1.default)();
const port = 4200;
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer);
app.use(express_1.default.static('public'));
const users = {};
const projectiles = {};
io.on('connection', (socket) => {
    console.log('a user connected !');
    const player = (0, helper_1.genRandomPlayer)();
    users[socket.id] = Object.assign(Object.assign({}, player), { id: socket.id, name: 'unknown' });
    io.emit('users updating', users);
    io.emit('projectiles updating', projectiles);
    socket.on('disconnect', (reason) => {
        console.log('a user disconnected!');
        delete users[socket.id];
        delete projectiles[socket.id];
    });
    socket.on('player moving', (data) => {
        console.log('data', data);
        const { socketId, x, y } = data;
        users[socketId] = Object.assign(Object.assign({}, users[socketId]), { x: users[socketId].x + x, y: users[socketId].y + y });
        io.emit('users updating', users);
    });
    socket.on('player attack', (data) => {
        console.log('data', data);
        const { socketId, velocity } = data;
        const attackingUser = users[socketId];
        if (attackingUser) {
            const projectile = {
                x: attackingUser.x,
                y: attackingUser.y,
                color: attackingUser.color,
                velocity,
                ownerId: socketId,
                id: `${socketId}_` + Date.now(),
            };
            projectiles[socketId] = projectiles[socketId]
                ? [...projectiles[socketId], projectile]
                : [projectile];
            io.emit('projectiles updating', projectiles);
        }
    });
    socket.on('remove projectile', (data) => {
        console.log('remove projectile');
        const { socketId, id } = data;
        if (projectiles[socketId]) {
            const index = projectiles[socketId].find((item) => item.id === id);
            if (index) {
                projectiles[socketId].splice(index, 1);
                io.emit('projectiles updating', projectiles);
            }
        }
    });
    socket.on('player dead', (data) => {
        const { playerId } = data;
        if (users[playerId]) {
            io.emit('explosion', playerId);
        }
    });
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
httpServer.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});