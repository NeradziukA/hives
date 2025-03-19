export default class Radar {
  constructor(stage, view) {
    let radar = new PIXI.Container();

    let circle1 = new PIXI.Graphics();
    radar.addChild(circle1);

    let circle2 = new PIXI.Graphics();
    radar.addChild(circle2);

    let circle3 = new PIXI.Graphics();
    radar.addChild(circle3);

    let circle4 = new PIXI.Graphics();
    radar.addChild(circle4);

    let circle5 = new PIXI.Graphics();
    radar.addChild(circle5);

    radar.x = window.innerWidth / 2;
    radar.y = window.innerHeight / 2;
    radar.scale.set(1, 1);
    radar.alpha = 0.3;

    this.radar = radar;
    this.circle1 = circle1;
    this.circle2 = circle2;
    this.circle3 = circle3;
    this.circle4 = circle4;
    this.circle5 = circle5;

    window.addEventListener('resize', () => {
      radar.x = window.innerWidth / 2;
      radar.y = window.innerHeight / 2;
    });

    this.setScale();
    stage.addChild(radar);
  }

  setScale(scale) {
    if (isNaN(scale)) {
      this.scale = 1;
      this.radar.scale.set(1, 1);
      return console.log('Scale must be a number. Set to default.')
    } else {
      this.scale = scale;
      this.circle1.clear();
      this.circle1.lineStyle (1, 0x00cdaf, 1);
      this.circle1.drawCircle(0, 0, 9.8 / this.scale);

      this.circle2.clear();
      this.circle2.lineStyle (1, 0x00ced1, 1);
      this.circle2.drawCircle(0, 0, 98 / this.scale);

      this.circle3.clear();
      this.circle3.lineStyle (1, 0x30b2cd, 1);
      this.circle3.drawCircle(0, 0, 980 / this.scale);

      this.circle4.clear();
      this.circle4.lineStyle (1, 0x618793, 1);
      this.circle4.drawCircle(0, 0, 9800 / this.scale);

      this.circle5.clear();
      this.circle5.lineStyle (1, 0x364144, 1);
      this.circle5.drawCircle(0, 0, 98000 / this.scale);
    }
  };

  getScale() {
    return this.scale;
  };
}