type EntityId = number;
let id = 0;
export function intId() {
  return id++;
}
export class Grid {
  public rows: Map<number, Set<EntityId>> = new Map();
  public columns: Map<number, Set<EntityId>> = new Map();

  constructor(public width: number, public height: number) {}

  registerEntity(entity: EntityId, x: number, y: number) {
    this.rows.set(y, this.rows.get(y) || new Set());
    this.rows.get(y)!.add(entity);
    this.columns.set(x, this.columns.get(x) || new Set());
    this.columns.get(x)!.add(entity);
  }
}
export class GridPoint {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = Math.round(x);
    this.y = Math.round(y);
  }

  moveTowards(angle: number, distance: number) {
    return new GridPoint(
      this.x + Math.cos(angle) * distance,
      this.y + Math.sin(angle) * distance
    );
  }
}

export function distance(a: GridPoint, b: GridPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
