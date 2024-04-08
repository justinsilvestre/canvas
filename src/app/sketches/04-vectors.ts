export function vectors(context: CanvasRenderingContext2D) {
  const width = context.canvas.width;
  const height = context.canvas.height;

  const vector1 = new Vector(
    randomInt(-width / 4, width / 4),
    randomInt(-height / 4, height / 4)
  );
  const vector2 = new Vector(
    randomInt(-width / 4, width / 4),
    randomInt(-height / 4, height / 4)
  );
  const color1 = `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(
    0,
    255
  )})`;
  const color2 = `rgb(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(
    0,
    255
  )})`;

  const vector1Length = vector1.length();
  const vector2Length = vector2.length();
  const distanceBetweenVectors = vector1.subtract(vector2).length();
  const directionFrom1To2 = vector2.subtract(vector1).normalize();

  // vectors from origin
  drawVector(context, vector1, Vector.zero, color1);
  drawVector(context, vector2, Vector.zero, color2);

  // vector2 "on top of" vector1
  const tranlucentColor2 = color2.replace("rgb", "rgba").replace(")", ", 0.5)");
  drawVector(context, vector2, vector1, tranlucentColor2);

  // distance between vector1 and vector2
  drawLine(context, vector1, vector2);

  // direction from vector1 to vector2
  const stretchedDirection = directionFrom1To2.scale(25);
  drawVector(context, stretchedDirection, vector1, "gray");

  // text for distance between vector1 and vector2
  const distanceBetweenVectorsText = `Distance: ${distanceBetweenVectors.toFixed(
    2
  )}`;
  const distanceBetweenVectorsTextPosition = vector1.add(vector2).scale(0.5);

  const trigger1 = new RadialTrigger(Vector.zero, vector1Length);
  const trigger2 = new RadialTrigger(vector1, vector2Length);

  const dotsCount = 10000;
  for (let i = 0; i < dotsCount; i++) {
    const randomVector = new Vector(
      randomInt(-width / 2, width / 2),
      randomInt(-height / 2, height / 2)
    );
    if (trigger1.check(randomVector)) {
      drawDot(context, randomVector, color1);
    } else if (trigger2.check(randomVector)) {
      drawDot(context, randomVector, color2);
    } else {
      const gray = "rgba(0, 0, 0, 0.1)";
      drawDot(context, randomVector, gray);
    }
  }

  const pointingTrigger = new PointingTrigger(vector2, 0);
  const linesCount = 100;
  for (let i = 0; i < linesCount; i++) {
    const randomDirection = new Vector(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();
    if (pointingTrigger.check(randomDirection)) {
      drawVector(context, randomDirection.scale(50), Vector.zero, color2);
    } else {
      const gray = "rgba(0, 0, 0, 0.1)";
      drawVector(context, randomDirection.scale(50), Vector.zero, gray);
    }
  }

  drawText(
    context,
    distanceBetweenVectorsText,
    distanceBetweenVectorsTextPosition.add(new Vector(5, 5))
  );

  drawText(
    context,
    `(${vector1.x}, ${vector1.y}) len:${vector1Length.toFixed(2)}`,
    vector1.add(new Vector(5, 5)),
    color1
  );
  drawText(
    context,
    `(${vector2.x}, ${vector2.y}) len:${vector2Length.toFixed(2)}`,
    vector2.add(new Vector(5, 5)),
    color2
  );
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  position: Vector,
  color: string = "black"
) {
  const gridPosition = toGridVector(position, context);

  // draw text outline
  context.strokeStyle = "white";
  context.font = "11px Arial";
  context.lineWidth = 3;
  context.strokeText(text, gridPosition.x, gridPosition.y);
  context.lineWidth = 1;

  // draw text
  context.fillStyle = color;
  context.fillText(text, gridPosition.x, gridPosition.y);
}

function drawVector(
  context: CanvasRenderingContext2D,
  vector: Vector,
  origin: Vector = Vector.zero,
  color: string = "black"
) {
  const vectorAfterOffset = toGridVector(vector.add(origin), context);
  const originAfterOffset = toGridVector(origin, context);

  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(originAfterOffset.x, originAfterOffset.y);
  context.lineTo(vectorAfterOffset.x, vectorAfterOffset.y);
  context.stroke();

  // dot at end
  context.fillStyle = color;
  context.beginPath();
  context.arc(vectorAfterOffset.x, vectorAfterOffset.y, 5, 0, Math.PI * 2);
  context.fill();
}

function drawLine(
  context: CanvasRenderingContext2D,
  from: Vector,
  to: Vector,
  color: string = "black"
) {
  const fromGrid = toGridVector(from, context);
  const toGrid = toGridVector(to, context);

  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(fromGrid.x, fromGrid.y);
  context.lineTo(toGrid.x, toGrid.y);
  context.stroke();
}

function drawDot(
  context: CanvasRenderingContext2D,
  position: Vector,
  color: string = "black"
) {
  const gridPosition = toGridVector(position, context);

  context.fillStyle = color;
  context.beginPath();
  context.arc(gridPosition.x, gridPosition.y, 2, 0, Math.PI * 2);
  context.fill();
}

function toGridVector(vector: Vector, context: CanvasRenderingContext2D) {
  const centerOffset = new Vector(
    context.canvas.width / 2,
    context.canvas.height / 2
  );
  return centerOffset.add(new Vector(vector.x, -vector.y));
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Vector {
  constructor(public x: number, public y: number) {}

  add(vector: Vector) {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector: Vector) {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  scale(scalar: number) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  normalize() {
    const length = this.length();
    return new Vector(this.x / length, this.y / length);
  }

  dotProduct(other: Vector) {
    return this.x * other.x + this.y * other.y;
  }

  static zero = new Vector(0, 0);
}

class RadialTrigger {
  constructor(public origin: Vector, public radius: number) {}

  check(point: Vector) {
    return point.subtract(this.origin).length() <= this.radius;
  }
}

class PointingTrigger {
  public normalizedOrigin: Vector;
  constructor(public origin: Vector, public threshold: number) {
    this.normalizedOrigin = origin.normalize();
  }

  check(direction: Vector) {
    return this.normalizedOrigin.dotProduct(direction) >= this.threshold;
  }
}
