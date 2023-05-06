const PLAYER_VELOCITY = 3
// the player attack
addEventListener('click', (event) => {
  const currentCoordinate = allUsers[socket.id]
  const angle = Math.atan2(
    event.clientY - currentCoordinate.y,
    event.clientX - currentCoordinate.x,
  )
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5,
  }

  socket.emit('player attack', {
    socketId: socket.id,
    velocity,
  })
})

// the player move
addEventListener('keydown', (event) => {
  if (event.code === 'ArrowUp') {
    socket.emit('player moving', {
      socketId: socket.id,
      y: -PLAYER_VELOCITY,
      x: 0,
    })
  }
  if (event.code === 'ArrowDown') {
    socket.emit('player moving', {
      socketId: socket.id,
      y: PLAYER_VELOCITY,
      x: 0,
    })
  }
  if (event.code === 'ArrowRight') {
    socket.emit('player moving', {
      socketId: socket.id,
      y: 0,
      x: PLAYER_VELOCITY,
    })
  }
  if (event.code === 'ArrowLeft') {
    socket.emit('player moving', {
      socketId: socket.id,
      y: 0,
      x: -PLAYER_VELOCITY,
    })
  }
})
