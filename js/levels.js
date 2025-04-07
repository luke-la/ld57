class Box {
  static front = [0, 1]
  static middle = [1, 1]
  static back = [2, 1]
  static all = [0, 3]
  static outside = [-1, 1]

  
  constructor(x, y, width, height, depth, hazzardous = false) {
    this.x = x;
    this.y = y;
    this.z = depth[0]
    this.width = width;
    this.height = height
    this.depth = depth[1]
    this.hazzardous = hazzardous
  }
  getScreenDimensionsTop(playerPos, tileSize) {
    const x = (this.x - playerPos.x) * tileSize;
    const width = this.width * tileSize;
    let y = (this.y - playerPos.y - (2 / 3)) * tileSize 
    if (this.depth <= 1) y += (tileSize / 3) * Math.abs(2 - this.z)
    const height = tileSize * this.depth / 3;

    return { x, y, width, height };
  }
  getScreenDimensionsSide(playerPos, tileSize) {
    const x = (this.x - playerPos.x) * tileSize;
    const width = this.width * tileSize;

    let y = (this.y - playerPos.y - (2 / 3)) * tileSize
    const height = this.height * tileSize
    if (this.depth <= 1) y += (tileSize / 3) * Math.abs(3 - this.z)
    else y += tileSize

    return { x, y, width, height };
  }
  getZIndex() {
    return (!this.hazzardous) ? this.z + this.depth : this.z
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
    const y = (this.y - playerPos.y) * tileSize - (tileSize * 2 / 3);
    const height = this.height * tileSize

    return { x, y, width, height };
  }
}

const background = {
  boat: new BackgroundDeco(28, -3.666, 10, 5),
  ocean: new BackgroundDeco(-100, 0, 200, 500),
  rigData: [
    new BackgroundDeco(-25, -20, 5, 500),
    new BackgroundDeco(20, -20, 5, 500),
    new BackgroundDeco(-30, 6, 60, 5),
    new BackgroundDeco(-35, 42, 70, 5),
    new BackgroundDeco(-35, 79, 80, 5),
    new BackgroundDeco(-48, 123, 85, 5),
  ]
}

const level0 = {
  floorData: [
    new Box(31, -1, 1, 1, Box.back),
  ],
  endingY: 0,
}

const level1 = {
  floorData: [
    new Box(18, 7, 15, 1, Box.all),
    new Box(12, 6, 4, 8, Box.all),

    new Box(-10, 10, 18, 3, Box.all),
    new Box(-13, 10, 3, 0.5, Box.back),
    new Box(-13, 10, 1, 0.5, Box.middle),
    new Box(-17, 10, 5, 0.5, Box.front),
    new Box(-19, 10, 2, 10, Box.all),

    new Box(-27, 7, 4, 6, Box.all),
  ],
  hazzardData: [
    new Box(11, 6.5, 1, 0.5, Box.all, true),
    new Box(11, 6.5, 3, 0.5, Box.outside, true),
    new Box(-16, 7, 2, 6, Box.back, true),
  ],
  endingY: 18,
};

const level2 = {
  floorData: [
    new Box(-36, 42, 8, 1, Box.all),
    new Box(-24, 32, 4, 7, Box.all),
    new Box(-24, 46, 4, 1, Box.all),
    
    new Box(-20, 43, 2, 1, Box.all),
    new Box(-18, 43, 4, 0.5, Box.back),
    new Box(-14, 43, 2, 4, Box.all),

    new Box(-12, 46, 11, 3, Box.all),
    new Box(-7, 44, 3, 2, Box.middle),
    new Box(-1, 46, 3, 0.5, Box.front),
    new Box(2, 46, 1, 0.5, Box.all),
    new Box(3, 46, 3, 0.5, Box.back),
    new Box(6, 46, 1, 0.5, Box.all),
    new Box(7, 46, 3, 0.5, Box.front),
    new Box(10, 46, 3, 3, Box.all),

    new Box(16, 44, 3, 1, Box.all),

    new Box(22, 43, 2, 0.5, Box.all),
    new Box(24, 43, 1, 0.5, Box.back),
    new Box(27, 43, 4, 0.5, Box.back),

    new Box(24, 43, 3, 0.5, Box.front),
    new Box(29, 43, 2, 0.5, Box.front),
    new Box(31, 43, 2, 0.5, Box.all),

    new Box(22, 47, 2, 0.5, Box.all),
    new Box(24, 47, 8, 0.5, Box.middle),
    
    new Box(34, 45, 6, 1, Box.all)
  ],
  hazzardData: [
    new Box(-30, 42, 4, 1, Box.all, true),
    new Box(-0.5, 35, 2, 20, Box.back, true),
    new Box(3.5, 35, 2, 20, Box.front, true),
    new Box(7.5, 35, 2, 20, Box.back, true),
    new Box(20.5, 46.5, 1.5, 1.5, Box.all, true),
    new Box(-7.5, 44, 0.5, 2, Box.middle, true),
    new Box(-4, 44, 0.5, 2, Box.middle, true),
  ],
  endingY: 55,
};

const level3 = {
  floorData: [
    new Box(35, 81, 15, 1, Box.all),
    new Box(30, 83, 2, 0.5, Box.all),

    // broken bridge
    new Box(27, 83, 1, 0.5, Box.all),
    new Box(24, 83, 3, 0.5, Box.back),
    new Box(14, 83, 1, 0.5, Box.middle),
    new Box(13.5, 83, 2, 0.5, Box.back),
    new Box(12, 83, 6, 0.5, Box.front),
    

    new Box(9, 83, 3, 0.5, Box.all),

    //tunnel
    new Box(2, 83, 3, 1, Box.all),
    new Box(2, 81, 3, 0.5, Box.back), // steps
    new Box(4, 78, 4, 0.5, Box.back),
    new Box(2, 75, 2, 0.5, Box.back),
    new Box(-8, 78, 5, 10, Box.front), // facades
    new Box(-3, 73, 5, 15, Box.front),
    new Box(-9, 78, 6, 1, Box.all), // roof
    new Box(-8, 84, 10, 1, Box.all), // floor
    new Box(-11, 83, 3, 1, Box.all),

    //above tunnel
    new Box(-3, 73, 5, 8, Box.all),
    new Box(-8, 73, 2, 5, Box.back),

    
  ],
  hazzardData: [
    new Box(22, 82, 1, 2, Box.all, true),
    new Box(20, 82.5, 2, 1, Box.back, true),
    new Box(2, 78, 0.5, 0.5, Box.all, true),
    new Box(0, 78, 2.5, 0.5, Box.outside, true),
    new Box(2, 74, 0.5, 0.5, Box.all, true),
    new Box(0, 74, 2.5, 0.5, Box.outside, true),
    new Box(-7.5, 73.5, 1, 4.5, Box.middle, true),
  ],
  endingY: 95
}

const levels = [level0, level1, level2, level3]