const canvas = document.getElementById("game-screen")
const ctx = canvas.getContext("2d")
canvas.width = 948
canvas.height = 533

tileHeight = 24;
frameRate = 10;

draw()

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red"
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const player = {
  pos: {
    x: 0,
    y: 0,
  },
  speed: 100
}

const pressedKeys = {
  w: false,
  a: false,
  s: false,
  d: false,
  space: false,
}
addEventListener("keydown", (e) => {
  toggleKeys(e)
})
addEventListener("keyup", (e) => {
  toggleKeys(e, false)
})

function toggleKeys(e, state = true) {
  if (e.key === "w") pressedKeys.w = state;
  if (e.key === "a") pressedKeys.a = state;
  if (e.key === "s") pressedKeys.s = state;
  if (e.key === "d") pressedKeys.d = state;
  if (e.key === " ") pressedKeys.space = state;
}


setInterval(update, 1000 / frameRate)

function update() {
  if (pressedKeys.a) player.pos.x += player.speed / frameRate;
  if (pressedKeys.d) player.pos.x -= player.speed / frameRate;
  if (pressedKeys.space) player.pos.y -= player.speed * 2;
  player.pos.y += player.speed / 4;
  console.log(player.pos)
}

