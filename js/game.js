const canvas = document.getElementById("game-screen");
const ctx = canvas.getContext("2d");
canvas.width = 948;
canvas.height = 533;

const tileSize = Math.ceil(canvas.height / 12);
const frameRate = 120;
const gravity = 1.7;
const termVelocity = 2;
const groundSlow = 0.01;
const waterSlow = 0.8;

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
    x: 32, // in meters
    y: -2, // +y moves down (same as screenspace)
    depth: 1.5, // affects which layer of map you interact with
  },
  size: {
    width: 0.5,
    height: 1,
    screenWidth: tileSize / 2,
    screenHeight: tileSize,
  },
  speed: 2, // m/s
  acceleration: 0.2,
  velocity: {
    x: 0,
    y: 0,
    d: 0,
  },
  onGround: false,
  status: "falling",
};

const tetherPoints = [];
const controlPoints = [];
const controlFidelity = 25;

function addTether() {
  tetherPoints.push(...controlPoints);
  tetherPoints.push({
    x: player.pos.x,
    y: player.pos.y + player.size.height / 2,
    z: player.pos.depth,
    onGround: false,
  });
  controlPoints.length = 0;
  for (let i = 0; i < controlFidelity; i++) {
    controlPoints.push({
      x: player.pos.x,
      y: player.pos.y + player.size.height / 2,
      z: player.pos.depth,
    });
  }
  timeoutControls(1000);
}

addTether();

function getScreenspaceTether(tp) {
  return {
    x: (tp.x - player.pos.x) * tileSize,
    y: (tp.y - player.pos.y) * tileSize + (tileSize / 3) * -(tp.z - 1),
  };
}

//HANDLE DRAWING ENVIRONMENT TO THE SCREEN

draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  ctx.fillStyle = "black";
  //ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(
    canvas.width / 2 - player.size.screenWidth / 2,
    canvas.height / 2 - player.size.screenHeight / 2
  );

  //draw background
  for (let bg of background.rigData) {
    ctx.fillStyle = "lightGrey";
    const rect = bg.getScreenDimensions(player.pos, tileSize);
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  }

  //draw level
  const drawData = [...level1.floorData, ...level2.floorData];
  drawData.sort(function (a, b) {
    a.getZIndex() - b.getZIndex;
  });

  let playerDrawn = false;

  for (let floor of drawData) {
    if (floor.depth[1] < player.pos.depth && !playerDrawn) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        0,
        (tileSize / 3) * -(player.pos.depth - 1),
        player.size.screenWidth,
        player.size.screenHeight
      );

      playerDrawn = true;
    }

    const topRect = floor.getScreenDimensionsTop(player.pos, tileSize);
    ctx.fillStyle = "black";
    ctx.fillRect(topRect.x, topRect.y, topRect.width, topRect.height);

    const sideRect = floor.getScreenDimensionsSide(player.pos, tileSize);
    ctx.fillStyle = "gray";
    ctx.fillRect(sideRect.x, sideRect.y, sideRect.width, sideRect.height);
  }
  if (!playerDrawn) {
    ctx.fillStyle = "red";
    ctx.fillRect(
      0,
      (tileSize / 3) * -(player.pos.depth - 1),
      player.size.screenWidth,
      player.size.screenHeight
    );

    playerDrawn = true;
  }

  ctx.lineWidth = 5;
  ctx.strokeStyle = "green";
  ctx.beginPath();
  const start = getScreenspaceTether(tetherPoints[0]);
  ctx.moveTo(start.x, start.y);
  for (let t of tetherPoints) {
    const point = getScreenspaceTether(t);
    ctx.lineTo(point.x, point.y);
  }
  ctx.strokeStyle = "yellow";
  for (let c of controlPoints) {
    const point = getScreenspaceTether(c);
    ctx.lineTo(point.x, point.y);
    ctx.fillRect(
      point.x,
      point.y,
      player.size.screenWidth / 4,
      player.size.screenWidth / 4
    );
  }
  ctx.lineTo(
    player.size.screenWidth / 2,
    (tileSize / 3) * -(player.pos.depth - 2)
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
  if (e.key === "t") addTether();
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
  if (pressedKeys.a && !pressedKeys.d)
    player.velocity.x = Math.max(
      -player.speed,
      player.velocity.x - player.acceleration
    );
  if (pressedKeys.d && !pressedKeys.a) {
    player.velocity.x = Math.min(
      player.speed,
      player.velocity.x + player.acceleration
    );
  }

  // handle depth
  if (pressedKeys.w && !pressedKeys.s)
    player.velocity.d = Math.min(
      player.speed,
      player.velocity.d + player.acceleration
    );
  if (pressedKeys.s && !pressedKeys.w)
    player.velocity.d = Math.max(
      -player.speed,
      player.velocity.d - player.acceleration
    );

  // handle jumping and falling
  if (pressedKeys.space && player.onGround) {
    player.velocity.y = -3;
    player.pos.y -= 0.1;
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
  const nextDepth = player.pos.depth + player.velocity.d / frameRate;

  if (nearestLevel) {
    const lastState = player.onGround;
    player.onGround = false;
    let groundFloor = null
    for (let floor of nearestLevel.floorData) {
      const box = {
        x: floor.x,
        y: floor.y,
        z: floor.depth[0],
        width: floor.width,
        height: floor.height,
        depth: floor.depth[1],
      };
      // check for ground
      if (!player.onGround) {
        const above = (player.pos.y + player.size.height <= box.y)
        const collision = isPlaneInBox(
          {
            x: nextX,
            y: nextY,
            width: player.size.width,
            height: player.size.height,
            z: nextDepth,
          },
          box
        );
        player.onGround = collision && above
        if (player.onGround && !groundFloor) groundFloor = floor
      }
      // check for left and right
      if (player.velocity.x != 0) {
        const collision = isPlaneInBox(
          {
            x: nextX,
            y: player.pos.y,
            width: player.size.width,
            height: player.size.height,
            z: player.pos.depth,
          },
          box
        );
        if (collision) player.velocity.x = 0
      }

      // check for back and front
      if (player.velocity.d != 0) {
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
        if (collision) player.velocity.d = 0
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
  let slow = (player.onGround) ? groundSlow : waterSlow
  if (player.velocity.x !== 0)
    player.velocity.x *= Math.pow(slow, 1 / frameRate)
  if (player.velocity.d !== 0) {
    player.velocity.d *= Math.pow(slow, 1 / frameRate)
  }

  // move player
  player.pos.x += player.velocity.x / frameRate;
  player.pos.y += player.velocity.y / frameRate;
  player.pos.depth += player.velocity.d / frameRate;

  // move tether control points
  for (let i in controlPoints) {
    let yAdjust = Math.sqrt(i, 2) / Math.sqrt(controlFidelity, 2);

    controlPoints[i].x +=
      (player.velocity.x / frameRate) * (i / controlFidelity);
    controlPoints[i].y += (player.velocity.y / frameRate) * yAdjust;
    controlPoints[i].z +=
      (player.velocity.d / frameRate) * (i / controlFidelity);
  }

  // redraw
  draw();
}
