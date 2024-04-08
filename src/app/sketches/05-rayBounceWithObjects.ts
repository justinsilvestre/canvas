import {
  CollisionGrid,
  drawLine,
  getRandomVelocity,
  HslaColor,
  Line,
  toCanvasGridVector,
  traceRayWithDots,
  Vector,
} from "./05-rayBounce";

export function rayBounceWithObjects(context: CanvasRenderingContext2D) {
  // clear canvas
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  let nextId = 0;
  function entityId() {
    return nextId++;
  }

  const grid = new CollisionGrid(context.canvas.width, context.canvas.height);
  const rays: Vector[] = [
    getRandomVelocity(),
    getRandomVelocity(),
    getRandomVelocity(),
    getRandomVelocity(),
    getRandomVelocity(),
  ];

  const bounds = [
    // top
    new Line(
      entityId(),
      new Vector(-context.canvas.width / 2, -context.canvas.height / 2),
      new Vector(context.canvas.width / 2, -context.canvas.height / 2)
    ),
    // right
    new Line(
      entityId(),
      new Vector(context.canvas.width / 2, -context.canvas.height / 2),
      new Vector(context.canvas.width / 2, context.canvas.height / 2)
    ),
    // bottom
    new Line(
      entityId(),
      new Vector(context.canvas.width / 2, context.canvas.height / 2),
      new Vector(-context.canvas.width / 2, context.canvas.height / 2)
    ),
    // left
    new Line(
      entityId(),
      new Vector(-context.canvas.width / 2, context.canvas.height / 2),
      new Vector(-context.canvas.width / 2, -context.canvas.height / 2)
    ),
  ];

  const polygons: Polygon[] = [
    Polygon.regular(
      entityId,
      getRandomPosition(
        -context.canvas.width / 2,
        context.canvas.width / 2,
        -context.canvas.height / 2,
        context.canvas.height / 2
      ),
      300,
      4
    ),
    // Polygon.regular(
    //   entityId,
    //   getRandomPosition(
    //     -context.canvas.width / 2,
    //     context.canvas.width / 2,
    //     -context.canvas.height / 2,
    //     context.canvas.height / 2
    //   ),
    //   200,
    //   3
    // ),
    // Polygon.regular(
    //   entityId,
    //   getRandomPosition(
    //     -context.canvas.width / 2,
    //     context.canvas.width / 2,
    //     -context.canvas.height / 2,
    //     context.canvas.height / 2
    //   ),
    //   50,
    //   4
    // ),
  ];

  for (const bound of bounds) {
    bound.addToGrid(grid);
    drawLineAndNormal(context, bound);
  }
  for (const polygon of polygons) {
    drawPolygon(context, polygon, polygon.lines);
    for (const line of polygon.lines) {
      line.addToGrid(grid);
    }
  }

  for (const ray of rays) {
    traceRayWithDots({
      context,
      start: Vector.zero,
      startVelocity: ray,
      dotsCount: 10000,
      startColor: HslaColor.random(),
      endColor: HslaColor.random().setAlpha(0),
      grid,
      canvasContext: context,
    });
  }

  drawGridCollisionPoints(context, grid);
}

class Polygon {
  public id: number;
  public lines: Line[] = [];
  constructor(
    public vertices: Vector[],
    public center: Vector,
    getId: () => number
  ) {
    this.id = getId();
    this.lines = [];

    for (let i = 0; i < this.vertices.length; i++) {
      this.lines.push(
        new Line(
          getId(),
          this.vertices[i],
          this.vertices[(i + 1) % this.vertices.length]
        )
      );
    }
  }

  static regular(
    getId: () => number,
    center: Vector,
    radius: number,
    sidesCount: number
  ) {
    const rotation = Math.PI / 4;

    const vertices = [];
    for (let i = 0; i < sidesCount; i++) {
      const angle = (i * Math.PI * 2) / sidesCount + rotation;
      const x = center.x + radius * Math.cos(angle);
      const y = center.y + radius * Math.sin(angle);
      vertices.push(Vector.gridCoordinates(x, y));
    }
    return new Polygon(vertices, center, getId);
  }
}

function drawPolygon(
  context: CanvasRenderingContext2D,
  polygon: Polygon,
  lines: Line[]
) {
  for (const line of lines) {
    drawLineAndNormal(context, line);
  }
}

function getRandomPosition(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) {
  return Vector.gridCoordinates(randomInt(minX, maxX), randomInt(minY, maxY));
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawLineAndNormal(context: CanvasRenderingContext2D, line: Line) {
  drawLine(context, line, "black");
  // draw normal
  const normal = line.normal();
  const midPoint = line.midPoint();

  const normalLineStart = midPoint.subtract(normal.scale(20));
  const normalLineEnd = midPoint.add(normal.scale(20));

  // draw dot at mid point
  drawDot(context, midPoint, "white");

  const normalLineStartGrid = toCanvasGridVector(normalLineStart, context);
  const normalLineEndGrid = toCanvasGridVector(normalLineEnd, context);
  // draw normal line manually
  context.strokeStyle = "red";
  context.beginPath();
  // context.lineWidth = 10;
  context.moveTo(normalLineStartGrid.x, normalLineStartGrid.y);
  context.lineTo(normalLineEndGrid.x, normalLineEndGrid.y);
  context.stroke();
}

function drawDot(
  context: CanvasRenderingContext2D,
  position: Vector,
  color: string = "black",
  radius = 2
) {
  const gridPosition = toCanvasGridVector(position, context);

  context.fillStyle = color;
  context.beginPath();
  context.arc(gridPosition.x, gridPosition.y, radius, 0, Math.PI * 2);
  context.fill();
}

function getAngleFromXAxis(vector: Vector) {
  return Math.atan2(vector.y, vector.x);
}

function reflect(velocity: Vector, normal: Vector) {
  return velocity.add(normal.scale(-2 * velocity.dotProduct(normal)));
}

function drawGridCollisionPoints(
  context: CanvasRenderingContext2D,
  grid: CollisionGrid
) {
  for (const [x, ys] of grid.grid) {
    for (const [y, objects] of ys) {
      if (y) {
        drawDot(context, Vector.gridCoordinates(x, y), "blue", 1);
      }
    }
  }
}
