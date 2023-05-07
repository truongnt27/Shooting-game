const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
let allUsers = {};
let players = [];
let projectiles = [];
let particles = [];
const socket = new io();

socket.on('users updating', (users) => {
  allUsers = users;
  players = Object.values(users).map(
    (user) =>
      new Player(user.x, user.y, user.radius, user.color, user.id, user.name),
  );
});

socket.on('explosion', (playerId) => {
  let newParticles = [];
  const existedParticle = particles.filter((el) => el.ownerId === playerId);
  const deadPlayer = allUsers[playerId];

  if (existedParticle.length > 0) {
    newParticles = newParticles.concat(existedParticle);
  } else {
    const tempBuffer = [];
    for (let i = 0; i < deadPlayer.radius * 2; i++) {
      tempBuffer.push(
        new Particle(
          deadPlayer.x,
          deadPlayer.y,
          Math.random() * 2,
          deadPlayer.color,
          {
            x: (Math.random() - 0.5) * (Math.random() * 6),
            y: (Math.random() - 0.5) * (Math.random() * 6),
          },
          playerId,
        ),
      );
    }
    newParticles = newParticles.concat(tempBuffer);
  }

  particles = newParticles;

  // remove player from screen
  players = players.filter((item) => item.id !== playerId);
});

socket.on('projectiles updating', (projectilesData) => {
  const newProjectiles = [];
  Object.values(projectilesData).forEach((projectilesByUser) => {
    projectilesByUser.forEach((item) => {
      const existedProjectile = projectiles.find((el) => el.id === item.id);
      newProjectiles.push(
        existedProjectile
          ? existedProjectile
          : new Projectile(
              item.x,
              item.y,
              5,
              item.color,
              item.velocity,
              item.ownerId,
              item.id,
            ),
      );
    });
  });

  projectiles = newProjectiles;
});

const scoreEl = document.querySelector('#scoreEl');
const img = document.getElementById('bg-image');

canvas.width = innerWidth;
canvas.height = innerHeight;

const x = canvas.width / 2;
const y = canvas.height / 2;

let animationId;
let score = 0;
function animate() {
  animationId = requestAnimationFrame(animate);
  // c.fillStyle = 'rgba(0, 0, 0, 0.1)';
  c.drawImage(img, 0, 0, canvas.width, canvas.height);
  // c.fillRect(0, 0, canvas.width, canvas.height);

  // draw explosions
  for (let index = 0; index < particles.length; index++) {
    const particle = particles[index];

    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
  }

  // draw players
  for (let idx = 0; idx < players.length; idx++) {
    const player = players[idx];
    player.draw();
  }

  // draw projectiles

  for (let idx = 0; idx < projectiles.length; idx++) {
    const projectile = projectiles[idx];
    projectile.update();

    // when projectiles touch a player
    for (let idx = 0; idx < players.length; idx++) {
      const player = players[idx];
      const dist = Math.hypot(projectile.x - player.x, projectile.y - player.y);

      if (
        projectile.ownerId !== player.id &&
        dist - player.radius - projectile.radius < 1 &&
        player.id === socket.id
      ) {
        // create explosions
        socket.emit('player dead', {
          playerId: player.id,
        });
      }
    }

    // remove from edges of screen
    if (
      projectile.ownerId === socket.id &&
      (projectile.x - projectile.radius < 0 ||
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height)
    ) {
      socket.emit('remove projectile', {
        socketId: socket.id,
        id: projectile.id,
      });
    }
  }
}

animate();
