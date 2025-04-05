class Floor {
  static DepthType = {
    front: 0,
    middle: 1,
    back: 2,
    all: 3,
  };
  constructor(startX, width, y, depth) {
    this.x = startX;
    this.width = width;
    this.y = y;
    this.depth = depth;
  }
  getScreenDimensions(playerPos, tileSize) {
    const x = (this.x - playerPos.x) * tileSize;
    const width = this.width * tileSize;

    let y = (this.y - playerPos.y) * tileSize - (tileSize * 2 / 3);
    let height = tileSize;

    if (this.depth != Floor.DepthType.all) {
      height /= 3
      y += height * Math.abs(2 - this.depth);
    }

    return { x, y, width, height };
  }
}

const level1 = {
  startingY: 10,
  floorData: [
    new Floor(-10, 15, 7, Floor.DepthType.all),
    new Floor(5, 4, 7, Floor.DepthType.middle),
  ],
};
