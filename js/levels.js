class Floor {
  static DepthType = {
    front: [0, 1],
    middle: [1, 2],
    back: [2, 3],
    all: [0, 3],
  };
  constructor(x, y, width, height, depth) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height
    this.depth = depth;
  }
  getScreenDimensionsTop(playerPos, tileSize) {
    const x = (this.x - playerPos.x) * tileSize;
    const width = this.width * tileSize;

    let y = (this.y - playerPos.y - (2 / 3)) * tileSize
    const height = tileSize * (this.depth[1] - this.depth[0]) / 3;

    if (this.depth !== Floor.DepthType.all) {
      y += height * Math.abs(2 - this.depth[0]);
    }

    return { x, y, width, height };
  }
  getScreenDimensionsSide(playerPos, tileSize) {
    const x = (this.x - playerPos.x) * tileSize;
    const width = this.width * tileSize;

    let y = (this.y - playerPos.y - (2 / 3)) * tileSize
    const height = this.height * tileSize
    const depth = tileSize * (this.depth[1] - this.depth[0]) / 3;

    if (this.depth !== Floor.DepthType.all) {
      y += depth * Math.abs(2 - this.depth[0]);
    }

    y += depth;

    return { x, y, width, height };
  }
}

class BackgroundDeco {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  getScreenDimensions(playerPos, tileSize) {
    const x = (this.x - playerPos.x) * tileSize;
    const width = this.width * tileSize;

    let y = (this.y - playerPos.y) * tileSize - (tileSize * 2 / 3);
    let height = this.height * tileSize

    return { x, y, width, height };
  }
}

const background = {
  ocean: new BackgroundDeco(-100, 0, 200, 500),
  rigData: [
    new BackgroundDeco(-25, -20, 5, 500),
    new BackgroundDeco(20, -20, 5, 500),
    new BackgroundDeco(-30, 6, 60, 5),
    new BackgroundDeco(-35, 42, 70, 5),
  ]
}

const level1 = {
  startingY: 0,
  floorData: [
    new Floor(18, 7, 15, 1, Floor.DepthType.all),
    new Floor(12, 6, 4, 10, Floor.DepthType.all),
    new Floor(-10, 10, 18, 1, Floor.DepthType.all),
    new Floor(-13, 10, 3, 0.5, Floor.DepthType.back),
    new Floor(-13, 10, 1, 0.5, Floor.DepthType.middle),
    new Floor(-17, 10, 5, 0.5, Floor.DepthType.front),
    new Floor(-19, 10, 2, 10, Floor.DepthType.all),
    new Floor(-27, 7, 4, 10, Floor.DepthType.all),
  ],
  endingY: 18,
};

const level2 = {
  startingY: 25,
  floorData: [
    new Floor(-36, 42, 8, 1, Floor.DepthType.all),
    new Floor(-24, 46, 4, 1, Floor.DepthType.all),
    new Floor(-20, 43, 2, 1, Floor.DepthType.back),
    new Floor(-20, 43, 2, 1, Floor.DepthType.middle),
    new Floor(-18, 43, 4, 1, Floor.DepthType.back),
    new Floor(-14, 43, 1, 1, Floor.DepthType.all),
    new Floor(-12, 46, 11, 1, Floor.DepthType.all),
    new Floor(-1, 46, 3, 1, Floor.DepthType.front),
    new Floor(2, 46, 1, 1, Floor.DepthType.all),
    new Floor(3, 46, 3, 1, Floor.DepthType.back),
    new Floor(6, 46, 1, 1, Floor.DepthType.all),
    new Floor(7, 46, 3, 1, Floor.DepthType.front),
    new Floor(10, 46, 3, 1, Floor.DepthType.all),
    new Floor(15, 44, 7, 1, Floor.DepthType.all),
  ],
  endingY: 50,
};

const levels = [level1, level2]