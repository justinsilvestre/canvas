import { distance, GridPoint } from "../Grid";

class Vector {
  constructor(public x: number, public y: number) {}

  crossProduct(other: Vector) {
    return this.x * other.y - this.y * other.x;
  }
}

class Polygon {
  constructor(
    public id: number,
    public vertices: GridPoint[],
    public center: GridPoint
  ) {}
}

export function polygonTiles(context: CanvasRenderingContext2D) {
  const cache: Map<number, Polygon> = new Map();
  const verticesToPolygons: Map<number, Map<number, Set<Polygon>>> = new Map();

  let id = 0;
  function intId() {
    return id++;
  }

  const width = context.canvas.width;
  const height = context.canvas.height;

  const gridCenter = new GridPoint(width / 2, height / 2);
  const startRadius = 70;
  const startSidesCount = 5;
  const startPolygon = createPolygon(
    intId(),
    gridCenter,
    startRadius,
    startSidesCount,
    degreesToRadians(-90),
    cache,
    verticesToPolygons
  );

  const layer2: Polygon[] = [];

  for (let i = 0; i < startPolygon.vertices.length; i++) {
    const newPolygonBaseVertices: GridPoint[] = [
      startPolygon.vertices[i],
      startPolygon.vertices[(i + 1) % startPolygon.vertices.length],
    ];
    const sidesCount = randomInt(3, 8);
    const midpoint = new GridPoint(
      (newPolygonBaseVertices[0].x + newPolygonBaseVertices[1].x) / 2,
      (newPolygonBaseVertices[0].y + newPolygonBaseVertices[1].y) / 2
    );
    const angleFromStartPolygonCenterToMidpoint = Math.atan2(
      midpoint.y - gridCenter.y,
      midpoint.x - gridCenter.x
    );
    const distanceToMidpoint = distance(gridCenter, midpoint);
    const newCenter = midpoint.moveTowards(
      angleFromStartPolygonCenterToMidpoint,
      distanceToMidpoint
    );

    layer2.push(
      continuePolygon(
        intId(),
        newPolygonBaseVertices,
        newCenter,
        startRadius,
        sidesCount,
        cache,
        verticesToPolygons
      )
    );
  }

  for (const polygon of layer2) {
    for (let i = 0; i < polygon.vertices.length; i++) {
      const newPolygonBaseVertices: GridPoint[] = [
        polygon.vertices[i],
        polygon.vertices[(i + 1) % polygon.vertices.length],
      ];
      const sidesCount = randomInt(3, 8);
      const midpoint = new GridPoint(
        (newPolygonBaseVertices[0].x + newPolygonBaseVertices[1].x) / 2,
        (newPolygonBaseVertices[0].y + newPolygonBaseVertices[1].y) / 2
      );
      const angleFromStartPolygonCenterToMidpoint = Math.atan2(
        midpoint.y - gridCenter.y,
        midpoint.x - gridCenter.x
      );
      const distanceToMidpoint = distance(gridCenter, midpoint);
      const newCenter = midpoint.moveTowards(
        angleFromStartPolygonCenterToMidpoint,
        distanceToMidpoint
      );

      continuePolygon(
        intId(),
        newPolygonBaseVertices,
        newCenter,
        startRadius,
        sidesCount,
        cache,
        verticesToPolygons
      );
    }
  }

  for (const [, polygon] of cache) {
    const lineColor = `hsla(${Math.random() * 255}, 100%, 50%, 0.5)`;
    drawPolygon(context, polygon, lineColor, "white");
  }
}

function drawLine(
  context: CanvasRenderingContext2D,
  start: GridPoint,
  end: GridPoint,
  width: number,
  color: string
) {
  context.moveTo(start.x, start.y);
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.stroke();
  context.closePath();
}

function drawPolygon(
  context: CanvasRenderingContext2D,
  polygon: Polygon,
  linesColor: string,
  centerDotColor: string
) {
  for (let i = 0; i < polygon.vertices.length; i++) {
    const thickness = (polygon.vertices.length - i + 1) * 2;

    drawLine(
      context,
      polygon.vertices[i],
      polygon.vertices[(i + 1) % polygon.vertices.length],
      thickness,
      linesColor
    );
  }

  context.beginPath();
  context.fillStyle = centerDotColor;
  context.arc(polygon.center.x, polygon.center.y, 3, 0, Math.PI * 2);
  context.fill();
  context.closePath();

  // write polygon id next to center point
  context.beginPath();
  context.fillStyle = "black";
  context.font = "12px Arial";
  context.fillText(
    polygon.id.toString(),
    polygon.center.x + 10,
    polygon.center.y
  );
  context.fill();
  context.closePath();
}

function createPolygon(
  id: number,
  center: GridPoint,
  radius: number,
  sides: number,
  startAngle: number,
  cache: Map<number, Polygon>,
  verticesToPolygons: Map<number, Map<number, Set<Polygon>>>
) {
  const angleStep = (Math.PI * 2) / sides;
  const vertices: GridPoint[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;
    vertices.push(new GridPoint(x, y));
  }
  const polygon = new Polygon(id, vertices, center);

  cache.set(polygon.id, polygon);
  for (const vertex of vertices) {
    verticesToPolygons.set(
      vertex.x,
      verticesToPolygons.get(vertex.x) || new Map()
    );
    verticesToPolygons
      .get(vertex.x)!
      .set(
        vertex.y,
        verticesToPolygons.get(vertex.x)!.get(vertex.y) || new Set()
      );
    verticesToPolygons.get(vertex.x)!.get(vertex.y)!.add(polygon);
  }
  return polygon;
}

function continuePolygon(
  id: number,
  /** at least two */
  baseVertices: GridPoint[],
  center: GridPoint,
  radius: number,
  sides: number,
  cache: Map<number, Polygon>,
  verticesToPolygons: Map<number, Map<number, Set<Polygon>>>
) {
  const newVertices: GridPoint[] = [...baseVertices];
  const lastSide = [baseVertices[baseVertices.length - 1], baseVertices[0]];
  const angleSign = isMovementCounterClockwise(center, lastSide[0], lastSide[1])
    ? -1
    : 1;
  const angleStep = ((Math.PI * 2) / sides) * angleSign;
  const startAngle = Math.atan2(
    baseVertices[0].y - center.y,
    baseVertices[0].x - center.x
  );
  for (let i = newVertices.length; i < sides; i++) {
    const angle = startAngle + i * angleStep;
    const x = center.x + Math.cos(angle) * radius;
    const y = center.y + Math.sin(angle) * radius;
    newVertices.push(new GridPoint(x, y));
  }
  const polygon = new Polygon(id, newVertices, center);
  cache.set(polygon.id, polygon);
  for (const vertex of newVertices) {
    verticesToPolygons.set(
      vertex.x,
      verticesToPolygons.get(vertex.x) || new Map()
    );
    verticesToPolygons
      .get(vertex.x)!
      .set(
        vertex.y,
        verticesToPolygons.get(vertex.x)!.get(vertex.y) || new Set()
      );
    verticesToPolygons.get(vertex.x)!.get(vertex.y)!.add(polygon);
  }

  return polygon;
}

function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

function isMovementCounterClockwise(
  center: GridPoint,
  start: GridPoint,
  end: GridPoint
) {
  // Calculate vectors from center to start and end points
  const vectorStart = new Vector(start.x - center.x, start.y - center.y);
  const vectorEnd = new Vector(end.x - center.x, end.y - center.y);

  // Calculate cross product of vectors to determine orientation
  const crossProduct = vectorStart.crossProduct(vectorEnd);

  // If cross product is positive, movement is counter-clockwise
  return crossProduct > 0;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
