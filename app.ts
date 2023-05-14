import express from 'express';
import { createServer } from 'http';
import { Server, DisconnectReason } from 'socket.io';
import { genRandomPlayer } from './helper';

const app = express();
const port = 4200;
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static('public'));
const users: any = {};
const projectiles: any = {};

io.on('connection', (socket) => {
  console.log('a user connected !');

  socket.on('disconnect', (reason) => {
    console.log('a user disconnected!');
    delete users[socket.id];
    delete projectiles[socket.id];
  });

  socket.on('player enter game', ({ name }: { name: string }) => {
    console.log('a user enter the game!');
    const player = genRandomPlayer();
    users[socket.id] = {
      ...player,
      id: socket.id,
      name,
    };

    io.emit('users updating', users);
    io.emit('projectiles updating', projectiles);
  });

  socket.on(
    'player moving',
    (data: { socketId: string; x: number; y: number }) => {
      const { socketId, x, y } = data;
      if (users[socketId]) {
        const newX = users[socketId].x + x;
        const newY = users[socketId].y + y;

        if (newX >= users[socketId].radius && newY >= users[socketId].radius) {
          users[socketId] = {
            ...users[socketId],
            x: newX,
            y: newY,
          };
          io.emit('users updating', users);
        }
      }
    },
  );

  socket.on(
    'player attack',
    (data: { socketId: string; velocity: { x: number; y: number } }) => {
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
    },
  );

  socket.on('remove projectile', (data: { socketId: string; id: string }) => {
    console.log('remove projectile');
    const { socketId, id } = data;
    if (projectiles[socketId]) {
      const index = projectiles[socketId].find((item: any) => item.id === id);
      if (index) {
        projectiles[socketId].splice(index, 1);
        io.emit('projectiles updating', projectiles);
      }
    }
  });

  socket.on('player dead', (data: { playerId: string }) => {
    const { playerId } = data;
    console.log(`${playerId} died !`);

    if (users[playerId]) {
      io.emit('explosion', playerId);
      delete users[socket.id];
      io.emit('users updating', users);
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
