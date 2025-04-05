const canvas = document.getElementById("game-screen");
const ctx = canvas.getContext("2d");
canvas.width = 948;
canvas.height = 533;

const tileSize = Math.ceil(canvas.height / 12);
const frameRate = 60;
const gravity = 0.02;
const termVelocity = 3
const groundFriction = 0.95

const player = {
  pos: {
    x: 32, // in meters
    y: 0, // +y moves down (same as screenspace)
    depth: 1.5, // affects which layer of map you interact with
  },
  size: {
    width: 0.5,
    height: 1,
    screenWidth: tileSize / 2,
    screenHeight: tileSize,
  },
  speed: 2, // m/s
  velocity: {
    x: 0,
    y: 0,
    d: 0
  },
  onGround: false,
};

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
    const rect = bg.getScreenDimensions(player.pos, tileSize)
    ctx.fillRect(
      rect.x,
      rect.y,
      rect.width,
      rect.height
    )
  }

  //draw level
  const drawData = [...level1.floorData, ...level2.floorData]
  drawData.sort(function(a, b) {a.depth - b.depth})
  let playerDrawn = false

  for (let floor of drawData) {
    console.log("here")
    if (floor.depth[1] < player.pos.depth && !playerDrawn) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        0,
        (tileSize / 3) * -(player.pos.depth - 1),
        player.size.screenWidth,
        player.size.screenHeight
      );
      
      playerDrawn = true
    }

    const topRect = floor.getScreenDimensionsTop(player.pos, tileSize);
    ctx.fillStyle = "black";
    ctx.fillRect(
      topRect.x,
      topRect.y,
      topRect.width,
      topRect.height
    );

    const sideRect = floor.getScreenDimensionsSide(player.pos, tileSize)
    ctx.fillStyle = "gray";
    ctx.fillRect(
      sideRect.x,
      sideRect.y,
      sideRect.width,
      sideRect.height
    );
  }
  if (!playerDrawn) {
    ctx.fillStyle = "red";
    ctx.fillRect(
      0,
      (tileSize / 3) * -(player.pos.depth - 1),
      player.size.screenWidth,
      player.size.screenHeight
    );
    
    playerDrawn = true
  }
  
  const lightness = Math.max(0, 100 - player.pos.y)
  ctx.fillStyle = `rgba(${lightness}, ${lightness}, 255, 0.5)`;
  const ocean = background.ocean.getScreenDimensions(player.pos, tileSize)
  ctx.fillRect(ocean.x, ocean.y, ocean.width, ocean.height);

  ctx.restore();
  
}


const pressedKeys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
};
addEventListener("keydown", (e) => {
  toggleKeys(e);
});
addEventListener("keyup", (e) => {
  toggleKeys(e, false);
});


function toggleKeys(e, state = true) {
  if (e.key === "w") pressedKeys.w = state;
  if (e.key === "a") pressedKeys.a = state;
  if (e.key === "s") pressedKeys.s = state;
  if (e.key === "d") pressedKeys.d = state;
  if (e.key === " ") pressedKeys.space = state;
}

setInterval(update, 1000 / frameRate);

function update() {
  const nearestLevel = levels.find((level) => player.pos.y > level.startingY && player.pos.y < level.endingY)

  //handle side to side movement
  if (pressedKeys.a) player.velocity.x = -player.speed;
  if (pressedKeys.d) player.velocity.x = player.speed;
  if (!pressedKeys.a && !pressedKeys.d) player.velocity.x *= groundFriction
  // handle depth
  if (pressedKeys.w) player.velocity.d = player.speed;
  if (pressedKeys.s) player.velocity.d = -player.speed;
  if (!pressedKeys.w && !pressedKeys.s) player.velocity.d *= groundFriction

  // handle jumping and falling
  if (pressedKeys.space && player.onGround) {
    player.velocity.y = -3;
    player.pos.y -= 0.1
    player.onGround = false;
  }
  
  if (!player.onGround) {
    if (player.velocity.y < -0.2 || player.velocity.y > 0.2) player.velocity.y += gravity
    else player.velocity.y += 0.1
    if (player.velocity.y > termVelocity) player.velocity.y = termVelocity
  }

  // test for falling collision
  if (nearestLevel) {
    player.onGround = nearestLevel.floorData.some(function (floor) {
      if (player.pos.depth > floor.depth[1] || player.pos.depth < floor.depth[0]) {
        return false;
      }
      if (floor.x > player.pos.x + player.size.width || floor.x + floor.width < player.pos.x) {
        return false;
      }
      if (floor.y <= player.pos.y + player.size.height && floor.y > player.pos.y) {
        player.pos.y = floor.y - player.size.height;
        player.velocity.y = 0;
        return true;
      }
      else return false;
    })
  }
  else {
    player.onGround = false
  }

  // move player
  player.pos.x += player.velocity.x / frameRate
  if (!player.onGround) player.pos.y += player.velocity.y / frameRate
  player.pos.depth += player.velocity.d / frameRate

  // redraw
  draw();
}
