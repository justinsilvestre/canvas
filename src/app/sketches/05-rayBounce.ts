export function rayBounce(context: CanvasRenderingContext2D) {
  let nextId = 0;
  function entityId() {
    return nextId++;
  }

  const grid = new CollisionGrid(context.canvas.width, context.canvas.height);
  const rays = [
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

  for (const bound of bounds) {
    bound.addToGrid(grid);
    drawLine(context, bound, "black");
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
}

export function getRandomVelocity() {
  const xSign = Math.random() < 0.5 ? -1 : 1;
  const ySign = Math.random() < 0.5 ? -1 : 1;
  const startVelocity = new Vector(
    randomInt(1, 10) * xSign,
    randomInt(1, 10) * ySign
  );
  return startVelocity;
}

export function traceRayWithDots({
  context,
  start,
  startVelocity,
  dotsCount,
  startColor,
  endColor,
  grid,
}: {
  context: CanvasRenderingContext2D;
  start: Vector;
  startVelocity: Vector;
  dotsCount: number;
  startColor: HslaColor;
  endColor: HslaColor;
  grid: CollisionGrid;
  canvasContext: CanvasRenderingContext2D;
}) {
  let position = start;
  let velocity = startVelocity;
  for (let i = 0; i < dotsCount; i++) {
    const color = startColor.blend(endColor, i / dotsCount);

    const newPotentialPosition = position.add(velocity);
    const collision = grid.checkCollision(position, newPotentialPosition);
    if (collision) {
      drawDot(context, collision.position, color.toString(), 15);
      const normal = grid.getNormal(
        collision.entityId,
        collision.position.x,
        collision.position.y
      );

      velocity = reflect(velocity, normal);
      console.log(velocity.length(), velocity.angleFromXAxis());
    } else {
      drawDot(context, newPotentialPosition, color.toString());
      position = newPotentialPosition;
    }
  }
}

export class HslaColor {
  constructor(
    public hue: number,
    public saturation: number,
    public lightness: number,
    public alpha: number
  ) {}

  toString() {
    return `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
  }

  blend(other: HslaColor, ratio: number = 0.5) {
    return new HslaColor(
      this.hue * (1 - ratio) + other.hue * ratio,
      this.saturation * (1 - ratio) + other.saturation * ratio,
      this.lightness * (1 - ratio) + other.lightness * ratio,
      this.alpha * (1 - ratio) + other.alpha * ratio
    );
  }

  setAlpha(alpha: number): HslaColor {
    return new HslaColor(this.hue, this.saturation, this.lightness, alpha);
  }

  static random() {
    return new HslaColor(
      randomInt(0, 360),
      randomInt(50, 100),
      randomInt(50, 100),
      1
    );
  }
}

function drawDot(
  context: CanvasRenderingContext2D,
  position: Vector,
  color: string = "black",
  radius: number = 3
) {
  const gridPosition = toCanvasGridVector(position, context);

  context.fillStyle = color;
  context.beginPath();
  context.arc(gridPosition.x, gridPosition.y, radius, 0, Math.PI * 2);
  context.fill();
}

export function toCanvasGridVector(
  vector: Vector,
  context: CanvasRenderingContext2D
) {
  const centerOffset = Vector.gridCoordinates(
    context.canvas.width / 2,
    context.canvas.height / 2
  );
  return centerOffset.add(new Vector(vector.x, -vector.y));
}

export class Vector {
  constructor(public x: number, public y: number) {}

  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  angleFromXAxis() {
    return Math.atan2(this.y, this.x);
  }

  // add(other: Vector) {
  //   this.x += other.x;
  //   this.y += other.y;
  //   return this;
  // }

  // subtract(other: Vector) {
  //   this.x -= other.x;
  //   this.y -= other.y;
  //   return this;
  // }

  // scale(scalar: number) {
  //   this.x *= scalar;
  //   this.y *= scalar;
  //   return this;
  // }

  // clamp(min: number, max: number) {
  //   this.x = Math.min(max, Math.max(min, this.x));
  //   this.y = Math.min(max, Math.max(min, this.y));
  //   return this;
  // }

  // normalize() {
  //   const length = this.length();
  //   this.x /= length;
  //   this.y /= length;
  //   return this;
  // }

  add(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  scale(scalar: number) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  normalize() {
    const length = this.length();
    return new Vector(this.x / length, this.y / length);
  }

  dotProduct(other: Vector) {
    return this.x * other.x + this.y * other.y;
  }
  crossProduct(other: Vector) {
    return this.x * other.y - this.y * other.x;
  }

  clone() {
    return new Vector(this.x, this.y);
  }

  static zero = new Vector(0, 0);

  /** converts x and y to integers */
  static gridCoordinates(x: number, y: number) {
    return new Vector(Math.round(x), Math.round(y));
  }
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type EntityId = number;

type GetNormal = (x: number, y: number) => Vector;

export class CollisionGrid {
  public grid: Map<number, Map<number, EntityId>> = new Map();

  public normals: Map<EntityId, GetNormal> = new Map();

  constructor(public width: number, public height: number) {}

  registerEntity(
    entityId: EntityId,
    x: number,
    y: number,
    getNormal: GetNormal
  ) {
    this.grid.set(x, this.grid.get(x) ?? new Map());
    this.grid.get(x)!.set(y, entityId);
    this.normals.set(entityId, getNormal);
  }

  findEntity(x: number, y: number) {
    const entity = this.grid.get(x)?.get(y);
    return entity ?? null;
  }

  // trace line from position to newPosition
  // check if any entity is in the way.
  // if so, return the position of the entity
  // otherwise, return null
  checkCollision(
    position: Vector,
    newPosition: Vector
  ): { position: Vector; entityId: EntityId } | null {
    for (const point of iterateOnPathBetweenPoints(position, newPosition)) {
      const entityId = this.findEntity(point.x, point.y);
      if (entityId !== null) {
        return { position: point, entityId };
      }
    }
    return null;
  }

  getNormal(entityId: EntityId, x: number, y: number) {
    return this.normals.get(entityId)!(x, y);
  }
}

function* iterateOnPathBetweenPoints(start: Vector, end: Vector) {
  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);
  const sx = start.x < end.x ? 1 : -1;
  const sy = start.y < end.y ? 1 : -1;
  let err = dx - dy;

  let x = start.x;
  let y = start.y;
  yield Vector.gridCoordinates(x, y);
  while (x !== end.x || y !== end.y) {
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
    yield Vector.gridCoordinates(x, y);
  }
}

function* iterateOnPathBetweenPointsWithoutJumpingDiagonally(
  start: Vector,
  end: Vector
) {
  let lastPoint = start;
  // iterate on the path between the points,
  // but when the next point is diagonal to the last point,
  // yield the intermediate point between the last point and the diagonal point
  // on the x axis
  // before yielding the diagonal point
  for (const point of iterateOnPathBetweenPoints(start, end)) {
    if (point.x !== lastPoint.x && point.y !== lastPoint.y) {
      const intermediatePoint = Vector.gridCoordinates(point.x, lastPoint.y);
      yield intermediatePoint;
    }
    yield point;
    lastPoint = point;
  }
}

function reflect(velocity: Vector, normal: Vector) {
  return velocity.subtract(normal.scale(2 * velocity.dotProduct(normal)));
}

function getGetNormal(normal: Vector) {
  return () => normal;
}

export class Line {
  constructor(public id: number, public start: Vector, public end: Vector) {}

  addToGrid(grid: CollisionGrid) {
    const normal = this.normal();
    const getNormal = getGetNormal(normal);
    for (const point of iterateOnPathBetweenPointsWithoutJumpingDiagonally(
      this.start,
      this.end
    )) {
      grid.registerEntity(this.id, point.x, point.y, getNormal);
    }
  }

  normal() {
    const dx = this.end.x - this.start.x;
    const dy = this.end.y - this.start.y;
    return new Vector(dy, -dx).normalize();
  }

  midPoint() {
    return new Vector(
      Math.round((this.start.x + this.end.x) / 2),
      Math.round((this.start.y + this.end.y) / 2)
    );
  }
}

export function drawLine(
  context: CanvasRenderingContext2D,
  line: Line,
  color: string
) {
  const start = toCanvasGridVector(line.start, context);
  const end = toCanvasGridVector(line.end, context);

  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
}
