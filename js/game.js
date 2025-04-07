const canvas = document.getElementById("game-screen");
const ctx = canvas.getContext("2d");
canvas.width = 1000; // 948
canvas.height = 500; // 533
let frameRate = 30;
const translate = {
  x: (canvas.width * 3) / 4,
  y: canvas.height / 2,
};

const overlay = document.getElementById("overlay");
overlay.style.width = `${canvas.width}px`;
overlay.style.height = `${canvas.height}px`;

let tileSize = Math.ceil(canvas.width / 22);

let inWater = false;

let gravity = 7;
let termVelocity = 6;
let groundSlow = 0.0001;
let waterSlow = 0.2;

let acceptingInput = false;
const pressedKeys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
};

const player = {
  pos: {
    x: 31, // in meters
    y: -2, // +y moves down (same as screenspace)
    z: 2.2, // affects which layer of map you interact with
  },
  center: {
    x: 0,
    y: 0,
    z: 0,
  },
  size: {
    width: 0.5,
    height: 1,
  },
  speed: 2, // m/s
  acceleration: 20,
  velocity: {
    x: 0,
    y: 0,
    z: 0,
  },
  nearestLevel: 0,
  onGround: false,
  mirrorSprite: true,
  sprites: {
    idle: new Sprite("./res/diveridle.png", 1, 1, 84, 84, 1, 1),
    moving: new Sprite("./res/diverrun.png", 1, 1, 84, 84, 13, 8),
    inAir: new Sprite("./res/diverfall.png", 1, 1, 84, 84, 3, 3),
    welding: new Sprite("./res/diverweld.png", 1, 1, 84, 84, 3, 3),
  },
  bubbles: [],
  welding: false,
};

// MENUS AND STUFF -----------------------------------------------------

const playMenu = document.getElementById("game-play-menu");

const playButton = document.getElementById("btn-play");
playButton.addEventListener("click", function () {
  // hide menu
  playMenu.style.display = "none";

  // pan camera
  const CameraPanRightInterval = setInterval(function () {
    if (translate.x > canvas.width / 2)
      translate.x -= ((translate.x - canvas.width / 2) * 3) / frameRate;
    else {
      translate.x = canvas.width / 2;
      clearInterval(CameraPanRightInterval);
    }
  }, 1000 / frameRate);

  // shove player into water
  setTimeout(function () {
    player.velocity.z -= 2;
  }, 1000);
  setTimeout(function () {
    player.velocity.z = 0;
  }, 2500);

  // let player play
  setTimeout(function () {
    acceptingInput = true;
  }, 3000);
});

function playerHitWater() {
  inWater = true;
  console.log("Water!");
  gravity = 1.5;
  termVelocity = 2;
  player.bubbles[0] = new BubbleGenerator(player.pos, 0.4, frameRate, true, 2);
}

function resetGame() {
  acceptingInput = false;
  inWater = false;
  gravity = 7;
  termVelocity = 6;
  (translate.x = (canvas.width * 3) / 4), (player.bubbles = []);
  player.pos = {
    x: 31,
    y: -3,
    z: 2.2,
  };

  tether.points = [];
  tether.flexPoints = [];
  addTetherAnchor(
    {
      x: 32,
      y: -1,
      z: 2,
    },
    false
  );
  tether.cut = false;

  playMenu.style.display = "block";
  overlay.style.backgroundColor = "hsla(0, 0%, 0%, 0%)";
}

// TETHER HANDLING -----------------------------------------------------

const tether = {
  points: [],
  flexPoints: [],
  fidelity: 6, // how many points are flexible
  gap: 0.64, // gap in game space before a new flex point is added
  flex: 0.7, // lower numbers means a quicker falloff of player affect on the tether
  cut: false, // this one is obvious
};

// adds all flex points to tether and removes them
function addTetherAnchor(point, timeout = true) {
  tether.points.push(...tether.flexPoints, point);
  tether.flexPoints.length = 0;
  addControPoint();
  if (timeout) timeoutControls(2000);
}

addTetherAnchor(
  {
    x: 32,
    y: -1,
    z: 2,
  },
  false
);

// moves oldest flex point to tether and generates new one on player

function addControPoint() {
  if (tether.flexPoints.length == tether.fidelity) {
    tether.flexPoints.reverse();
    tether.points.push(tether.flexPoints.pop());
    tether.flexPoints.reverse();
  }
  tether.flexPoints.push({
    x: player.pos.x + player.size.width / 2,
    y: player.pos.y + player.size.height / 2,
    z: player.pos.z,
  });
}

// again obvious
function cutTether(index) {
  tether.cut = true;
  const removedPoints = tether.flexPoints.splice(0, index);
  tether.points.push(...removedPoints);

  tether.flex = 1;
  player.bubbles[1] = new BubbleGenerator(
    tether.flexPoints[0],
    0.05,
    frameRate,
    false
  );

  setTimeout(resetGame, 4000);
}

function getScreenspacePoint(p) {
  return {
    x: (p.x - player.pos.x) * tileSize,
    y: (p.y - player.pos.y) * tileSize + (tileSize / 3) * -(p.z - 1),
  };
}

// DRAWING -----------------------------------------------------

const sprites = {
  bgHorizontal: new Sprite("./res/bghoriz.png", 5, 5, 120, 120, 2, 2),
  bgVertical: new Sprite("./res/bgvert.png", 5, 10, 120, 240, 1, 1),
  bgBoat: new Sprite("./res/bgship.png", 10, 5, 240, 120, 1, 1),
};

function isOnScreen(x, y, w, h) {
  if (
    x > translate.x ||
    x + w < -translate.x ||
    y > translate.y ||
    y + h < -translate.y
  )
    return false;
  else return true;
}

function isOnScreen({x, y, width, height}) {
  if (
    x > translate.x ||
    x + width < -translate.x ||
    y > translate.y ||
    y + height < -translate.y
  )
    return false;
  else return true;
}

let overlayLast = 0;

function draw() {
  const startTime = Date.now();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.fillStyle = "lightblue";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(translate.x, translate.y);

  //draw background

  for (let bg of background.rigData) {
    ctx.fillStyle = "lightGrey";
    let bgSprite;
    if (bg.width > bg.height) bgSprite = sprites.bgHorizontal;
    else bgSprite = sprites.bgVertical;
    if (bgSprite) {
      const cropInfo = bgSprite.getSpriteCropInfo();
      for (let i = 0; i < bg.height / bgSprite.gameSize.height; i++) {
        for (let j = 0; j < bg.width / bgSprite.gameSize.width; j++) {
          const start = bg.getScreenDimensions(player.pos, tileSize);
          start.x += j * bgSprite.gameSize.width * tileSize;
          start.y += i * bgSprite.gameSize.height * tileSize;
          if (isOnScreen(start.x, start.y, start.width, start.height)) {
            ctx.drawImage(
              bgSprite.image,
              cropInfo.sx,
              cropInfo.sy,
              cropInfo.swidth,
              cropInfo.sheight,
              start.x,
              start.y,
              bgSprite.gameSize.width * tileSize,
              bgSprite.gameSize.height * tileSize
            );
          }
        }
      }
    } else {
      const rect = bg.getScreenDimensions(player.pos, tileSize);
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  const boatPos = background.boat.getScreenDimensions(player.pos, tileSize);
  if (isOnScreen(boatPos)) {
    const cropInfo = sprites.bgBoat.getSpriteCropInfo();
    ctx.drawImage(
      sprites.bgBoat.image,
      cropInfo.sx,
      cropInfo.sy,
      cropInfo.swidth,
      cropInfo.sheight,
      boatPos.x,
      boatPos.y,
      sprites.bgBoat.gameSize.width * tileSize,
      sprites.bgBoat.gameSize.height * tileSize
    );
  }

  //draw level
  const drawData = [];
  const minLevelToDraw = Math.max(1, player.nearestLevel - 1);
  const maxLevelToDraw = Math.min(levels.length - 1, player.nearestLevel + 1);
  for (let i = minLevelToDraw; i <= maxLevelToDraw; i++) {
    if (levels[i].floorData) drawData.push(...levels[i].floorData);
    if (levels[i].hazzardData) drawData.push(...levels[i].hazzardData);
  }
  drawData.sort(function (a, b) {
    return b.getZIndex() - a.getZIndex();
  });

  let playerDrawn = false;

  for (let d of drawData) {
    if (d.getZIndex() < player.pos.z && !playerDrawn) {
      /*ctx.fillStyle = "blue";
      ctx.fillRect(
        0,
        (tileSize / 3) * -(player.pos.z - 1),
        player.size.width * tileSize,
        player.size.height * tileSize
      );*/
      ctx.save();

      let sprite = player.sprites.idle;
      if (pressedKeys.w || pressedKeys.a || pressedKeys.s || pressedKeys.d)
        sprite = player.sprites.moving;
      if (!player.onGround) sprite = player.sprites.inAir;
      if (player.welding) sprite = player.sprites.welding;
      let x = 0;
      let y = (tileSize / 3) * -(player.pos.z - 1);

      // correct for sprite size diff from hitbox
      ctx.translate((-player.size.width * tileSize) / 2, 0);
      if (player.mirrorSprite) {
        ctx.scale(-1, 1);
        x -= tileSize;
      }
      const cropInfo = sprite.getSpriteCropInfo();
      ctx.drawImage(
        sprite.image,
        cropInfo.sx,
        cropInfo.sy,
        cropInfo.swidth,
        cropInfo.sheight,
        x,
        y,
        sprite.gameSize.width * tileSize,
        sprite.gameSize.height * tileSize
      );
      sprite.checkFrameCount(frameRate);

      ctx.restore();

      playerDrawn = true;
    }

    if (d.hazzardous) ctx.fillStyle = "red";
    else ctx.fillStyle = "#444";
    const topRect = d.getScreenDimensionsTop(player.pos, tileSize);
    ctx.fillRect(topRect.x, topRect.y, topRect.width + 1, topRect.height + 1);

    if (d.hazzardous) ctx.fillStyle = "darkred";
    else ctx.fillStyle = "black";
    const sideRect = d.getScreenDimensionsSide(player.pos, tileSize);
    ctx.fillRect(
      sideRect.x,
      sideRect.y,
      sideRect.width + 1,
      sideRect.height + 1
    );
  }

  // draw tether
  // get line segments

  ctx.lineWidth = 5;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  const start = getScreenspacePoint(tether.points[0]);
  ctx.moveTo(start.x, start.y);
  for (let i = 0; i < tether.points.length; i++) {
    const point = getScreenspacePoint(tether.points[i]);
    ctx.lineTo(point.x, point.y);
  }
  if (tether.cut) {
    ctx.stroke();
    const startFlex = getScreenspacePoint(tether.points[0]);
    ctx.beginPath(startFlex.x, startFlex.y);
  }
  for (let i = 0; i < tether.flexPoints.length; i++) {
    const point = getScreenspacePoint(tether.flexPoints[i]);
    ctx.lineTo(point.x, point.y);
  }
  ctx.lineTo(
    (player.size.width * tileSize) / 2,
    (tileSize / 3) * -(player.pos.z - 2)
  );
  ctx.stroke();

  // draw bubbles
  const bubbles = [];
  for (let bubg of player.bubbles) {
    bubbles.push(...bubg.bubbles);
  }
  ctx.fillStyle = "white";
  for (let b of bubbles) {
    const pos = getScreenspacePoint(b);
    ctx.fillRect(
      pos.x,
      pos.y,
      (b.size * tileSize) / 16,
      (b.size * tileSize) / 16
    );
  }
  // draw water

  const lightness = 150 - player.pos.y / 100 //????????? bflsbfhsdjhcba
  const transparancy = (inWater) ? 50 + (player.pos.y2 / 10) : 80;
  ctx.fillStyle = `hsla(220, 50%, 50%, ${transparancy}%)`;
  const ocean = background.ocean.getScreenDimensions(player.pos, tileSize);
  ctx.fillRect(ocean.x, ocean.y, ocean.width, ocean.height);

  ctx.restore();

  if (inWater) {
    ctx.font = "bold 20px monospace";
    ctx.textBaseline = "top";
    ctx.fillStyle = "white";
    ctx.fillText(`DEPTH: ${(player.pos.y + 1).toFixed(0)}`, 15, 15);
  }

  for (let key in sprites) sprites[key].checkFrameCount(frameRate);

  // if tether is cut, darken overlay to black
  if (tether.cut && overlayLast < 255) {
    overlay.style.backgroundColor = `hsla(${0},${0}%,${0}%,${overlayLast}%`;
    overlayLast += 30 / frameRate;
  }

  console.log(`Draw Time: ${Date.now() - startTime}`);
}

// HANDLE PLAYER INPUT -----------------------------------------------------

addEventListener("keydown", (e) => {
  toggleKeys(e);
});
addEventListener("keyup", (e) => {
  toggleKeys(e, false);
});

function toggleKeys(e, state = true) {
  if (!acceptingInput) return;
  if (e.key === "w" || e.key == "W") pressedKeys.w = state;
  if (e.key === "a" || e.key == "A") pressedKeys.a = state;
  if (e.key === "s" || e.key == "S") pressedKeys.s = state;
  if (e.key === "d" || e.key == "D") pressedKeys.d = state;
  if (e.key === "t" && player.onGround) {
    player.welding = true;
    addTetherAnchor({
      x: player.pos.x + player.size.width / 2,
      y: player.pos.y + player.size.height / 2,
      z: player.pos.z,
    });
  }
  if (e.key === " ") pressedKeys.space = state;
}

function timeoutControls(ms) {
  acceptingInput = false;
  pressedKeys.w = false;
  pressedKeys.a = false;
  pressedKeys.s = false;
  pressedKeys.d = false;
  pressedKeys.space = false;
  setTimeout(function () {
    acceptingInput = true;
    player.welding = false;
  }, ms);
}

// HANDLE GAME LOOP -----------------------------------------------------

let lastFrame = Date.now();
function loop() {
  const deltaTime = Date.now() - lastFrame;
  frameRate = 1000 / deltaTime;

  update();
  lastFrame = Date.now();
  requestAnimationFrame(loop);
  console.log(`Frame Rate: ${frameRate}`);
}

requestAnimationFrame(loop);

function update() {
  const startTime = Date.now();
  //tileSize = (canvas.width + player.pos.y * 5) / 18;
  if (!inWater) {
    if (player.pos.y + player.size.height / 2 > 0) playerHitWater();
  }

  player.nearestLevel = levels.findIndex(
    (level) => player.pos.y < level.endingY
  );

  //handle side to side movement
  if (pressedKeys.a && !pressedKeys.d) {
    player.velocity.x = -player.speed;
    player.mirrorSprite = true;
  }
  if (pressedKeys.d && !pressedKeys.a) {
    player.velocity.x = player.speed;
    player.mirrorSprite = false;
  }

  // handle depth
  if (pressedKeys.w && !pressedKeys.s)
    player.velocity.z = Math.min(
      player.speed,
      player.velocity.z + player.acceleration
    );
  if (pressedKeys.s && !pressedKeys.w)
    player.velocity.z = Math.max(
      -player.speed,
      player.velocity.z - player.acceleration
    );

  // if player is moving
  if (
    player.bubbles[0] &&
    (pressedKeys.a || pressedKeys.d || pressedKeys.w || pressedKeys.s)
  ) {
    player.bubbles[0].cycleSpeed = 1;
    player.bubbles[0].rate = 0.2;
  } else if (player.bubbles[0]) {
    player.bubbles[0].cycleSpeed = 2;
    player.bubbles[0].rate = 0.4;
  }

  // handle jumping and falling
  if (pressedKeys.space && player.onGround) {
    player.velocity.y += -3;
    player.onGround = false;
  }

  if (player.velocity.y < -0.2 || player.velocity.y > 0.2)
    player.velocity.y += gravity / frameRate;
  else player.velocity.y += 0.1;
  if (player.velocity.y > termVelocity) player.velocity.y = termVelocity;

  // test for collision
  const nextX = player.pos.x + player.velocity.x / frameRate;
  const nextY = player.pos.y + player.velocity.y / frameRate;
  const nextDepth = player.pos.z + player.velocity.z / frameRate;

  if (levels[player.nearestLevel].floorData) {
    player.onGround = false;
    let groundFloor = null;
    for (let floor of levels[player.nearestLevel].floorData) {
      const box = {
        x: floor.x,
        y: floor.y,
        z: floor.z,
        width: floor.width,
        height: floor.height,
        depth: floor.depth,
      };

      // if dist is bigger than box, throw out
      if (
        dist(player.pos, box) >
        Math.max(box.width, box.height, box.depth) + 3
      )
        continue;

      // check for ground || ceiling
      if (!player.onGround) {
        const above = player.pos.y + player.size.height <= box.y;
        const collision = isPlaneInBox(
          {
            x: player.pos.x,
            y: nextY,
            width: player.size.width,
            height: player.size.height,
            z: player.pos.z,
          },
          box
        );
        player.onGround = collision && above;
        if (player.onGround && !groundFloor) groundFloor = floor;
      }

      let sideCollision = false;

      // check for left and right
      if (player.velocity.x != 0) {
        const collision = isPlaneInBox(
          {
            x: nextX,
            y: player.pos.y,
            width: player.size.width,
            height: player.size.height,
            z: player.pos.z,
          },
          box
        );
        if (collision) {
          player.velocity.x = 0;
          sideCollision = collision;
        }
      }

      // check for back and front
      if (player.velocity.z != 0) {
        const collision = isPlaneInBox(
          {
            x: nextX,
            y: player.pos.y,
            width: player.size.width,
            height: player.size.height,
            z: nextDepth,
          },
          box
        );
        if (collision) {
          player.velocity.z = 0;
          sideCollision = collision;
        }
      }

      // if player is high enough, allow mantle
      if (
        sideCollision &&
        player.pos.y < floor.y &&
        player.pos.y + player.size.height > floor.y
      ) {
        player.onGround = true;
        if (!groundFloor) groundFloor = floor;
      }
    }

    // if player hits ground, cancel velocity
    if (groundFloor) {
      player.pos.y = groundFloor.y - player.size.height;
      player.velocity.y = 0;
    }

    console.log(player.onGround);
  } else {
    player.onGround = false;
  }

  // handle friction
  let slow = player.onGround ? groundSlow : waterSlow;
  if (player.velocity.x !== 0)
    player.velocity.x *= Math.pow(slow, 1 / frameRate);
  if (player.velocity.z !== 0) {
    player.velocity.z *= Math.pow(slow, 1 / frameRate);
  }

  // move player
  player.pos.x += player.velocity.x / frameRate;
  player.pos.y += player.velocity.y / frameRate;
  player.pos.z += player.velocity.z / frameRate;
  player.center.x = player.pos.x - player.size.width / 2;
  player.center.y = player.pos.y - player.size.height / 2;
  player.center.z = player.pos.z;

  // add tether control point if needed
  const lastFlexPoint = tether.flexPoints[tether.flexPoints.length - 1];
  const playerFlexPoint = {
    x: player.pos.x + player.size.width / 2,
    y: player.pos.y + player.size.height / 2,
    z: player.pos.z,
  };
  if (
    lastFlexPoint &&
    playerFlexPoint &&
    dist(playerFlexPoint, lastFlexPoint) > tether.gap &&
    !tether.cut
  )
    addControPoint();

  // move tether control points
  let last;
  let cut = false;
  let indexCut;

  for (let i = tether.flexPoints.length - 1; i >= 0; i--) {
    let xDiff, yDiff, zDiff;
    if (!last) {
      xDiff = (player.velocity.x / frameRate) * tether.flex;
      yDiff = (player.velocity.y / frameRate) * tether.flex;
      zDiff = (player.velocity.z / frameRate) * tether.flex;
    } else {
      xDiff = last.x * tether.flex;
      yDiff = last.y * tether.flex;
      zDiff = last.z * tether.flex;
    }

    // test collision for not movement
    if (levels[player.nearestLevel].floorData) {
      for (let floor of levels[player.nearestLevel].floorData) {
        const box = {
          x: floor.x,
          y: floor.y,
          z: floor.z,
          width: floor.width,
          height: floor.height,
          depth: floor.depth,
        };

        // again, if too far away, skip checks
        if (
          dist(tether.flexPoints[i], box) >
          Math.max(box.width, box.height, box.depth) + 3
        )
          continue;

        // x collides
        if (
          isPointInBox(
            { ...tether.flexPoints[i], x: tether.flexPoints[i].x + xDiff },
            box
          )
        )
          xDiff = 0;
        // y collides
        if (
          isPointInBox(
            { ...tether.flexPoints[i], y: tether.flexPoints[i].y + yDiff },
            box
          )
        ) {
          /* TRYING TO GET THE ROPE TO GO TO THE EGDE!!!
          const check = 10
          const step = 0.2
          let steps = 0
          let found = false
          let sign = 1
          while (steps < check && found !== true) {
            steps++
            sign = (steps % 2 === 0) ? -1 : 1;
            if (!isPointInBox(
              {
                x: tether.flexPoints[i].x + (step * steps * sign),
                y: tether.flexPoints[i].y + yDiff,
                z: tether.flexPoints[i].z,
              },
              box
            )) found = true
          }
          if (found) tether.flexPoints.splice(i, 1, {
            x: tether.flexPoints[i].x + (step * (steps - 1) * sign),
            y: tether.flexPoints[i].y,
            z: tether.flexPoints[i].z,
          })*/
          yDiff = 0;
        }
        // z collides
        if (
          isPointInBox(
            { ...tether.flexPoints[i], z: tether.flexPoints[i].z + yDiff },
            box
          )
        )
          zDiff = 0;
      }
    }
    if (levels[player.nearestLevel].hazzardData) {
      for (let hazzard of levels[player.nearestLevel].hazzardData) {
        if (isPointInBox(tether.flexPoints[i], hazzard)) {
          cut = true;
          indexCut = i;
        }
      }
    }

    last = {
      x: xDiff,
      y: yDiff,
      z: zDiff,
    };

    tether.flexPoints[i].x += xDiff;
    tether.flexPoints[i].y += yDiff;
    tether.flexPoints[i].z += zDiff;
  }

  //update bubbles
  for (let bubg of player.bubbles) {
    //bubg.makeBubble()
    if (bubg) bubg.updateBubbles();
  }

  if (cut) cutTether(indexCut);

  // redraw
  draw();

  console.log(`Update Time: ${Date.now() - startTime}`);
}
