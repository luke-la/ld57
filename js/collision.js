function isPointInBox(point, box) {
  return (
    point.x >= box.x &&
    point.x < box.x + box.width &&
    point.y >= box.y &&
    point.y < box.y + box.height &&
    point.z >= box.z &&
    point.z < box.z + box.depth
  );
}

function isPlaneInBox(plane, box) {
  return (
    plane.z > box.z &&
    plane.z < box.z + box.depth &&
    plane.y < box.y + box.height &&
    plane.y + plane.height > box.y &&
    plane.x < box.x + box.width &&
    plane.x + plane.width > box.x
  );
}

function dist(p1, p2) {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2)
  );
}

// Run Collision Tests
function logTest(testName, expected, result) {
  if (expected === result) {
    console.log(
      `TEST ${testName.toUpperCase()}: Returned ${expected} as expected.`
    );
  } else {
    console.log(`${testName} returned ${!expected}. Expected: ${expected}`);
  }
}

const testBox = {
  x: -1,
  y: -1,
  z: -1,
  width: 2,
  height: 2,
  depth: 2,
};

console.log("COLLISION TESTS");
logTest("Point Away", false, isPointInBox({ x: 5, y: -2, z: 3 }, testBox));
logTest("Point Above", false, isPointInBox({ x: 0, y: -1, z: 5 }, testBox));
logTest("Point Colliding", true, isPointInBox({ x: 0, y: -1, z: 0 }, testBox));

logTest(
  "Plane Away",
  false,
  isPlaneInBox({ x: 2, y: -7, width: 4, height: 6, z: -5 }, testBox)
);
logTest(
  "Plane Z Offset",
  false,
  isPlaneInBox({ x: -1, y: 0, width: 2, height: 1, z: -5 }, testBox)
);
logTest(
  "Plane Above",
  false,
  isPlaneInBox({ x: -1, y: 5, width: 2, height: 1, z: 0 }, testBox)
);
logTest(
  "Plane Colliding Top",
  true,
  isPlaneInBox({ x: -1, y: -1, width: 2, height: 1, z: 0 }, testBox)
);
logTest(
  "Plane Colliding Bottom",
  true,
  isPlaneInBox({ x: -1, y: -1, width: 2, height: 1, z: 0 }, testBox)
);
logTest(
  "Plane Colliding Left",
  true,
  isPlaneInBox({ x: -1, y: -2, width: 2, height: 4, z: 0 }, testBox)
);
logTest(
  "Plane Colliding Right",
  true,
  isPlaneInBox({ x: 0, y: -2, width: 2, height: 4, z: 0 }, testBox)
);
