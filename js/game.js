const canvas = document.getElementById("game-screen");
const ctx = canvas.getContext("2d");
canvas.width = 948;
canvas.height = 533;

const tileSize = Math.ceil(canvas.width / 20);
const frameRate = 120;
const gravity = 1.5;
const termVelocity = 2;
const groundSlow = 0.0001;
const waterSlow = 0.2;

let acceptingInput = true;
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
    y: -1, // +y moves down (same as screenspace)
    z: 1.5, // affects which layer of map you interact with
  },
  size: {
    width: 1,
    height: 1,
  },
  speed: 2, // m/s
  acceleration: 0.1,
  velocity: {
    x: 0,
    y: 0,
    z: 0,
  },
  onGround: false,
  mirrorSprite: true,
  sprites: {
    moving: new Sprite("./res/diverrun.png", 1, 1, 42, 42, 13, frameRate, 8),
  },
};

const tether = {
  points: [],
  flexPoints: [],
  fidelity: 8,
  gap: 1.5,
  flex: 0.7,
  cut: false,
};

function addTetherAnchor(point) {
  tether.points.push(...tether.flexPoints, point);
  tether.flexPoints.length = 0;
  for (let i = 0; i < tether.fidelity; i++) {
    tether.flexPoints.push({
      x: player.pos.x + player.size.width / 2,
      y: player.pos.y + player.size.height / 2,
      z: player.pos.z,
    });
  }
  timeoutControls(1000);
}

function addControPoint() {
  tether.flexPoints.reverse();
  tether.points.push(tether.flexPoints.pop());
  tether.flexPoints.reverse();
  tether.flexPoints.push({
    x: player.pos.x + player.size.width / 2,
    y: player.pos.y + player.size.height / 2,
    z: player.pos.z,
  });
}

function cutTether(index) {
  tether.cut = true;
  const removedPoints = tether.flexPoints.splice(0, index);
  tether.points.push(...removedPoints);
  console.log(removedPoints);
  console.log(tether.points);
  tether.flex = 1;
}

addTetherAnchor({
  x: player.pos.x + player.size.width / 2,
  y: player.pos.y + player.size.height / 2,
  z: player.pos.z,
});

function getScreenspaceTether(p) {
  return {
    x: (p.x - player.pos.x) * tileSize,
    y: (p.y - player.pos.y) * tileSize + (tileSize / 3) * -(p.z - 1),
  };
}

// HANDLE DRAWING ENVIRONMENT TO THE SCREEN
const drawData = [];
for (let level of levels)
  drawData.push(...level.floorData, ...level.hazzardData);
drawData.sort(function (a, b) {
  return b.getZIndex() - a.getZIndex();
});

draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.fillStyle = "black";
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(
    canvas.width / 2 - (player.size.width * tileSize) / 2,
    canvas.height / 2 - (player.size.height * tileSize) / 2
  );

  //draw background
  for (let bg of background.rigData) {
    ctx.fillStyle = "lightGrey";
    const rect = bg.getScreenDimensions(player.pos, tileSize);
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  //draw level

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
      ctx.save()

      const sprite = player.sprites.moving
      let x = 0
      let y = (tileSize / 3) * -(player.pos.z - 1)

      if (player.mirrorSprite) {
        ctx.scale(-1, 1)
        x -= tileSize
      }
      const cropInfo = sprite.getSpriteCropInfo()
      ctx.drawImage(
        sprite.image,
        cropInfo.sx,
        cropInfo.sy,
        cropInfo.swidth,
        cropInfo.sheight,
        x,
        y,
        sprite.gameSize.width * tileSize,
        sprite.gameSize.height * tileSize,
      );
      /*ctx.drawImage(
        player.sprites.moving.image,
        0,
        (tileSize / 3) * -(player.pos.z - 1)
      );*/
      ctx.restore()

      playerDrawn = true;
    }

    if (d.hazzardous) ctx.fillStyle = "red";
    else ctx.fillStyle = "gray";
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

  ctx.lineWidth = 5;
  ctx.strokeStyle = "black";
  ctx.beginPath();
  const start = getScreenspaceTether(tether.points[0]);
  ctx.moveTo(start.x, start.y);
  for (let i = 0; i < tether.points.length; i++) {
    const point = getScreenspaceTether(tether.points[i]);
    ctx.lineTo(point.x, point.y);
  }
  if (tether.cut) {
    ctx.stroke();
    const startFlex = getScreenspaceTether(tether.points[0]);
    ctx.beginPath(startFlex.x, startFlex.y);
  }
  for (let i = 0; i < tether.flexPoints.length; i++) {
    const point = getScreenspaceTether(tether.flexPoints[i]);
    ctx.lineTo(point.x, point.y);
  }
  /*for (let i = 0; i < tether.flexPoints.length; i++) {
    const point = getScreenspaceTether(tether.flexPoints[i]);
    ctx.lineTo(point.x, point.y);
    ctx.fillRect(point.x, point.y, tileSize / 6, tileSize / 6);
  }*/
  ctx.lineTo(
    (player.size.width * tileSize) / 2,
    (tileSize / 3) * -(player.pos.z - 2)
  );
  ctx.stroke();

  const lightness = Math.max(0, 100 - player.pos.y);
  ctx.fillStyle = `rgba(${lightness}, ${lightness}, 255, 0.5)`;
  const ocean = background.ocean.getScreenDimensions(player.pos, tileSize);
  ctx.fillRect(ocean.x, ocean.y, ocean.width, ocean.height);

  ctx.restore();
}

// HANDLE PLAYER INPUT

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
  if (e.key === "t" && player.onGround)
    addTetherAnchor({
      x: player.pos.x + player.size.width / 2,
      y: player.pos.y + player.size.height / 2,
      z: player.pos.z,
    });
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
  }, ms);
}

// HANDLE GAME LOOP

setInterval(update, 1000 / frameRate);

function update() {
  const nearestLevel = levels.find(
    (level) => player.pos.y > level.startingY && player.pos.y < level.endingY
  );

  //handle side to side movement
  if (pressedKeys.a && !pressedKeys.d) {
    player.velocity.x = Math.max(
      -player.speed,
      player.velocity.x - player.acceleration
    );
    player.mirrorSprite = true;
  }
  if (pressedKeys.d && !pressedKeys.a) {
    player.velocity.x = Math.min(
      player.speed,
      player.velocity.x + player.acceleration
    );
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

  // handle jumping and falling
  if (pressedKeys.space && player.onGround) {
    player.velocity.y += -3;
    player.onGround = false;
  }

  if (!player.onGround) {
    if (player.velocity.y < -0.2 || player.velocity.y > 0.2)
      player.velocity.y += gravity / frameRate;
    else player.velocity.y += 0.1;
    if (player.velocity.y > termVelocity) player.velocity.y = termVelocity;
  }

  // test for collision
  const nextX = player.pos.x + player.velocity.x / frameRate;
  const nextY = player.pos.y + player.velocity.y / frameRate;
  const nextDepth = player.pos.z + player.velocity.z / frameRate;

  if (nearestLevel) {
    const lastState = player.onGround;
    player.onGround = false;
    let groundFloor = null;
    for (let floor of nearestLevel.floorData) {
      const box = {
        x: floor.x,
        y: floor.y,
        z: floor.z,
        width: floor.width,
        height: floor.height,
        depth: floor.depth,
      };

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
        if (collision && player.velocity.y < 0) player.velocity.y = 0;
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
      if (sideCollision && player.pos.y < floor.y) {
        player.onGround = true;
        if (!groundFloor) groundFloor = floor;
      }
    }

    // if player hits ground, cancel velocity
    if (lastState !== player.onGround && player.onGround) {
      player.pos.y = groundFloor.y - player.size.height;
      player.velocity.y = 0;
    }
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

  // add tether control point if needed
  const lastFlexPoint = tether.flexPoints[tether.flexPoints.length - 2];
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
    if (nearestLevel) {
      for (let floor of nearestLevel.floorData) {
        const box = {
          x: floor.x,
          y: floor.y,
          z: floor.z,
          width: floor.width,
          height: floor.height,
          depth: floor.depth,
        };
        // x collides
        if (
          isPointInBox(
            {
              x: tether.flexPoints[i].x + xDiff,
              y: tether.flexPoints[i].y,
              z: tether.flexPoints[i].z,
            },
            box
          )
        )
          xDiff = 0;
        // y collides
        if (
          isPointInBox(
            {
              x: tether.flexPoints[i].x,
              y: tether.flexPoints[i].y + yDiff,
              z: tether.flexPoints[i].z,
            },
            box
          )
        )
          yDiff = 0;
        // z collides
        if (
          isPointInBox(
            {
              x: tether.flexPoints[i].x,
              y: tether.flexPoints[i].y,
              z: tether.flexPoints[i].z + zDiff,
            },
            box
          )
        )
          zDiff = 0;
      }

      for (let hazzard of nearestLevel.hazzardData) {
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
  if (cut) cutTether(indexCut);

  // redraw
  draw();
}
