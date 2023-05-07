class Player {
  constructor(x, y, radius, color, id, name) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = 3;
    this.id = id;
    this.name = name;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();

    c.font = 'bold 16px Arial';
    c.fillStyle = this.color;
    c.textAlign = 'center';
    c.fillText(this.name, this.x, this.y + this.radius + 16);
  }
}
