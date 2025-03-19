export class Coords {
  x: number;
  y: number;
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  get() {
    return { x: this.x, y: this.y };
  }
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
