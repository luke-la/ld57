const canvas = document.getElementById("game-screen");
const ctx = canvas.getContext("2d");
canvas.width = 948;
canvas.height = 533;

tileSize = Math.ceil(canvas.width / 24);
frameRate = 60;

const player = {
  pos: {
    x: 0, // in meters
    y: 5, // +y moves down (same as screenspace)
    depth: 1.5, // affects which layer of map you interact with
  },
  size: {
    width: 0.5,
    height: 1,
    screenWidth: tileSize / 2,
    screenHeight: tileSize,
  },
  speed: 2, // m/s
  fallVel: 0,
  onGround: false,
};

draw();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let lightness = Math.max(0, 150 - player.pos.y)
  ctx.fillStyle = `rgba(${lightness}, ${lightness}, 255, 1)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.fillStyle = "black";
  ctx.translate(
    canvas.width / 2 - player.size.screenWidth / 2,
    canvas.height / 2 - player.size.screenHeight / 2
  );
  for (let floor of level1.floorData) {
    const floorDimen = floor.getScreenDimensions(player.pos, tileSize);
    ctx.fillRect(
      floorDimen.x,
      floorDimen.y,
      floorDimen.width,
      floorDimen.height
    );
  }
  ctx.fillStyle = "red";
  ctx.fillRect(
    0,
    (tileSize / 3) * -(player.pos.depth - 1),
    player.size.screenWidth,
    player.size.screenHeight
  );
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
  //handle side to side movement
  if (pressedKeys.a) player.pos.x -= player.speed / frameRate;
  if (pressedKeys.d) player.pos.x += player.speed / frameRate;

  // handle jumping and falling
  if (pressedKeys.space && player.onGround) {
    player.fallVel = -3;
    player.onGround = false;
  }
  if (!player.onGround) {
    player.pos.y += player.fallVel / frameRate;
    player.fallVel =
      player.fallVel < 3
        ? (player.fallVel += Math.abs(player.fallVel / frameRate))
        : 3;
    if (Math.abs(player.fallVel) < 0.1) player.fallVel = 0.1;
  }

  // test for falling collision
  player.onGround = level1.floorData.some(function (floor) {
    if (floor.depth !== Floor.DepthType.all && floor.depth != Math.floor(player.pos.depth)) {
      return false;
    }
    if (floor.x > player.pos.x + player.size.width || floor.x + floor.width < player.pos.x) {
      return false;
    }
    if (floor.y < player.pos.y + player.size.height && floor.y > player.pos.y) {
      player.pos.y = floor.y - player.size.height;
      player.fallVel = 0;
      return true;
    }
    else return false;
  })

  // handle depth
  if (pressedKeys.w) player.pos.depth += player.speed / frameRate;
  
  if (pressedKeys.s) player.pos.depth -= player.speed / frameRate;

  // redraw
  draw();
}
