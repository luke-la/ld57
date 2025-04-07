class BubbleGenerator {
  constructor(pos, rate, fps, cycle, cycleSpeed = 1) {
    this.bubbles = [];
    this.pos = pos;
    this.rate = rate;
    this.fps = fps;
    this.cycle = cycle;
    if (cycleSpeed) {
      this.cycleSpeed = cycleSpeed;
      this.cycleCounter = 0;
    }
    this.rateCounter = 0;
  }
  makeBubble() {
    if (this.cycle) {
      this.cycleCounter =
        (this.cycleCounter + 1) % Math.ceil(this.fps * this.cycleSpeed * 2);
      if (this.cycleCounter < this.fps * this.cycleSpeed) return;
    }

    this.rateCounter = (this.rateCounter + 1) % Math.ceil(this.fps * this.rate);
    if (this.rateCounter !== 0) return;
    const size = Math.ceil(Math.random() * 3);
    const speed = (0.5 * size) / this.fps;
    const dir = ((Math.random() + Math.random()) / 2 - 0.5) * (speed / 2);
    this.bubbles.push({
      x: this.pos.x + dir,
      y: this.pos.y,
      z: this.pos.z,
      size,
      speed,
      dir,
    });
  }
  updateBubbles() {
    this.makeBubble();
    for (let i = 0; i < this.bubbles.length; i++) {
      this.bubbles[i].y -= this.bubbles[i].speed;
      this.bubbles[i].x -= this.bubbles[i].dir;
      if (this.bubbles[i].y < this.pos.y - 3) this.bubbles.splice(i, 1);
    }
  }
}
