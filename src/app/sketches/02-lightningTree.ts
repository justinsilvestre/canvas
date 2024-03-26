import { distance, GridPoint } from "../Grid";
import { tracePath } from "./01-rainbowRopes";

export function lightningTree(
  width: number,
  height: number,
  ctx: CanvasRenderingContext2D
) {
  const branchingDepth = 8;
  const tree = treeStructure({
    startLocation: new GridPoint(width / 2, height / 2),
    startAngle: (Math.PI / 2) * Math.random(),
    trunkPoints: 50,
    stepLength: 20,
    branchingDepth,
    baseBranchingRate: 0.2,
    canvasSize: { width, height },
  });

  tracePath(ctx, tree.path, branchingDepth);
  function traceBranchesRecursive(branch: TreeBranch, currentDepth = 0) {
    console.log("tracing depth", currentDepth);
    const color = `hsla(${currentDepth * 30 + 90}, 100%, 45%, 0.1)`;
    for (const subBranch of branch.branches) {
      tracePath(ctx!, subBranch.path, branchingDepth - currentDepth + 1, color);
      traceBranchesRecursive(subBranch, currentDepth + 1);
    }
  }
  traceBranchesRecursive(tree);
}

class TreeBranch {
  public branches: TreeBranch[] = [];
  public path: GridPoint[] = [];
  constructor(public start: GridPoint, public angle: number) {
    this.path.push(start);
  }
}

function treeStructure({
  startLocation,
  startAngle,
  trunkPoints,
  branchingDepth,
  baseBranchingRate,
  canvasSize,
  stepLength = 30,
}: {
  startLocation: GridPoint;
  startAngle: number;
  trunkPoints: number;
  branchingDepth: number;
  baseBranchingRate: number;
  canvasSize: { width: number; height: number };
  stepLength?: number;
}) {
  function locationIsWithinBounds(location: GridPoint) {
    return (
      location.x > 0 &&
      location.x < canvasSize.width &&
      location.y > 0 &&
      location.y < canvasSize.height
    );
  }
  function locationIsFarEnough(
    location: GridPoint,
    otherLocations: GridPoint[]
  ) {
    return otherLocations.every(
      (otherLocation) => distance(location, otherLocation) >= stepLength
    );
  }

  const trunk = new TreeBranch(startLocation, startAngle);

  const triesMax = 10;
  let trunkAngle = startAngle;
  for (let i = 0; i < trunkPoints; i++) {
    let newPoint = continueBranchPath(
      trunk.path[trunk.path.length - 1],
      trunkAngle,
      stepLength
    );
    let triesLeft = triesMax;
    while (
      triesLeft > 0 &&
      (!locationIsWithinBounds(newPoint.location) ||
        !locationIsFarEnough(newPoint.location, trunk.path))
    ) {
      triesLeft--;
      newPoint = continueBranchPath(
        trunk.path[trunk.path.length - 1],
        trunkAngle,
        stepLength
      );
    }
    if (triesLeft !== 0) {
      trunk.path.push(newPoint.location);
      trunkAngle = newPoint.angle;
    }
  }

  function getBranchesAtDepth(startBranch: TreeBranch, depth: number) {
    if (depth === 0) {
      return [startBranch];
    }
    let branches: TreeBranch[] = startBranch.branches;

    let depthReached = 1;
    while (depthReached < depth) {
      branches = branches.flatMap((branch) => branch.branches);
      depthReached++;
    }
    return branches;
  }

  for (let currentDepth = 0; currentDepth < branchingDepth; currentDepth++) {
    const branchesAtDepth = getBranchesAtDepth(trunk, currentDepth);
    console.log("currentDepth", currentDepth, branchesAtDepth);
    // deteriorates slowly as depth increases
    const branchingRate = baseBranchingRate * (1 / (currentDepth + 1));
    for (const branch of branchesAtDepth) {
      for (const location of branch.path) {
        if (Math.random() < branchingRate) {
          const newBranch = new TreeBranch(location, startAngle);
          let branchAngle = startAngle;
          for (let i = 0; i < 20; i++) {
            let newPoint = continueBranchPath(
              newBranch.path[newBranch.path.length - 1],
              branchAngle,
              stepLength
            );

            newBranch.path.push(newPoint.location);
            branchAngle = newPoint.angle;
          }
          branch.branches.push(newBranch);
        }
      }
    }
  }

  return trunk;
}

function continueBranchPath(
  previousLocation: GridPoint,
  angle: number,
  stepLength: number
): { location: GridPoint; angle: number } {
  // const angleDelta = random(-0.75, 0.75)
  const angleDelta = randomFloat(-1, 1);
  const newAngle = angle + angleDelta;
  const x = previousLocation.x + Math.cos(newAngle) * stepLength;
  const y = previousLocation.y + Math.sin(newAngle) * stepLength;
  return { location: new GridPoint(x, y), angle: newAngle };
}

function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
