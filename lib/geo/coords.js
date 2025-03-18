export class Coords {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    return this;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
  get() {
    return { x: this.x, y: this.y };
  }
}
