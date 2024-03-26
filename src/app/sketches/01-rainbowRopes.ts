import { distance, GridPoint } from "../Grid";

export function rainbowRopes(
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
) {
  for (let i = 0; i < 7; i++) {
    for (const path of treePaths({
      start: new GridPoint(Math.random() * width, Math.random() * height),
      pointsCount: 800,
      stepLength: 7,
    })) {
      tracePath(ctx, path);
      dotPath(ctx, path);
    }
  }
}

function treePaths({
  start,
  pointsCount,
  stepLength,
  startBranchRate = 0.8,
}: {
  start: GridPoint;
  pointsCount: number;
  stepLength: number;
  startBranchRate?: number;
}) {
  const paths: GridPoint[][] = [];
  const trunk = windingPath({
    start,
    pointsCount,
    stepLength,
    width: window.innerWidth,
    height: window.innerHeight,
  });
  paths.push(trunk);
  let branchRate = startBranchRate;
  for (let i = 1; i < trunk.length; i++) {
    if (Math.random() < branchRate) {
      const trunkPoint = trunk[i];
      const previousTrunkPoint = trunk[i - 1];
      const branch: GridPoint[] = [trunkPoint];
      // perpendicular to trunk
      let angle = Math.atan2(
        trunkPoint.y - previousTrunkPoint.y,
        trunkPoint.x - previousTrunkPoint.x
      );
      // flip angle, 50/50 chance
      if (Math.random() < 0.5) {
        angle += Math.PI / 2;
      }

      // add to branch until a point from paths is hit
      while (true) {
        const previous = branch[branch.length - 1];

        const angleDelta = Math.random() * -1.75 + 0.75;
        angle += angleDelta;

        const x = previous.x + Math.cos(angle) * stepLength;
        const y = previous.y + Math.sin(angle) * stepLength;
        const newPoint = new GridPoint(x, y);
        // prettier-ignore
        // const newPointIsWithinBounds =
        //   newPoint.x > (0 + stepLength * 2) &&
        //   newPoint.x < (width - stepLength * 2) &&
        //   newPoint.y > (0 + stepLength * 2) &&
        //   newPoint.y < (height - stepLength * 2)
        // if (!newPointIsWithinBounds) {
        //   break
        // }
        const newPointIsFarEnough = branch.every(
          (location) => distance(location, newPoint) >= stepLength * 0.75
        ) &&
          paths.every((path) => path.every(
            (location) => distance(location, newPoint) >= stepLength * 0.75
          )
          );
        if (!newPointIsFarEnough) {
          break;
        }
        branch.push(newPoint);
      }

      paths.push(branch);
    }
  }
  return paths;
}

export function tracePath(
  ctx: CanvasRenderingContext2D,
  locations: GridPoint[],
  thickness = 1,
  color = "hsla(0, 0%, 0%, 0.3 )"
) {
  ctx.beginPath();
  ctx.moveTo(locations[0].x, locations[0].y);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  for (let i = 1; i < locations.length; i++) {
    const { x, y } = locations[i];
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}
function dotPath(ctx: CanvasRenderingContext2D, locations: GridPoint[]) {
  for (let i = 0; i < locations.length; i++) {
    const { x, y } = locations[i];
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    const color = Math.floor(Math.random() * 255);
    ctx.fillStyle = `hsla(${color}, 100%, 50%, 0.3)`;
    ctx.fill();
  }
}

function windingPath({
  start,
  pointsCount,
  stepLength,
  width,
  height,
}: {
  start: GridPoint;
  pointsCount: number;
  stepLength: number;
  width: number;
  height: number;
}) {
  const path: GridPoint[] = [start];
  let angle = 0;
  for (let i = 0; i < pointsCount; i++) {
    const previous = path[path.length - 1];
    const angleDelta = Math.random() * -0.75 + 0.75;
    angle += angleDelta;

    const x = previous.x + Math.cos(angle) * stepLength;
    const y = previous.y + Math.sin(angle) * stepLength;
    let newLocation = new GridPoint(x, y);
    // check if new location is intersecting with any other location
    // or if it's out of bounds
    let triesLeft = 10;
    while (
      triesLeft > 0 &&
      (path.some((location) => distance(location, newLocation) < stepLength) ||
        newLocation.x < 0 ||
        newLocation.x > width ||
        newLocation.y < 0 ||
        newLocation.y > height)
    ) {
      triesLeft--;
      angle += Math.PI / 2;
      const x = previous.x + Math.cos(angle) * stepLength;
      const y = previous.y + Math.sin(angle) * stepLength;
      newLocation = new GridPoint(x, y);
    }
    if (triesLeft === 0) {
      // back up and try again
      if (path.length > 1) {
        path.pop();
      }
      continue;
    } else path.push(newLocation);
  }

  return path;
}
