export default class Zoom {
  constructor(stage /*, view, zoom*/) {
    this.listeners = [];
    this.scale = 1;

    let zoomControl = new PIXI.Container();

    let line = new PIXI.Graphics();
    line.lineStyle(4, 0x888888, 1);
    line.moveTo(0, 17);
    line.lineTo(0, 83);
    let circlePlus = new PIXI.Sprite(PIXI.loader.resources['img/plus_green.png'].texture);
    circlePlus.position.set(0, 0);
    circlePlus.scale.set(0.5, 0.5);
    circlePlus.anchor.set(0.5, 0.5);
    circlePlus.interactive = true;
    circlePlus.buttonMode = true;
    circlePlus.on('pointerdown', () => {
      //view.decScale();
      //zoom.decScale();

      let digs = Math.ceil(Math.log10(Math.abs(this.scale) + 0.5));
      let scale;

      if (!(this.scale % 10)) {
        digs--;
      }

      scale = Math.pow(10, digs);

      if (this.scale - scale <= 0 && digs > 0) {
        this.scale -= Math.pow(10, --digs);
      } else {
        this.scale -= scale;
      }

      if (this.scale < 1) {
        this.scale = 1
      }

      console.log(this.scale);

      this.listeners.forEach((el) => {
        el.setScale(this.scale);
      });
    });

    let circleMinus = new PIXI.Sprite(PIXI.loader.resources['img/minus_green.png'].texture);
    circleMinus.position.set(0, 100);
    circleMinus.scale.set(0.5, 0.5);
    circleMinus.anchor.set(0.5, 0.5);
    circleMinus.interactive = true;
    circleMinus.buttonMode = true;
    circleMinus.on('pointerdown', () => {
      //view.incScale();
      //zoom.incScale();

      this.scale += Math.pow(10, Math.ceil(Math.log10(Math.abs(this.scale) + 0.5)) - 1);
      console.log(this.scale);

      this.listeners.forEach((el) => {
        el.setScale(this.scale);
      });
    });

    zoomControl.addChild(circlePlus);
    zoomControl.addChild(circleMinus);
    zoomControl.addChild(line);
    zoomControl.x = 30;
    zoomControl.y = window.innerHeight / 2 - window.innerHeight / 3;
    zoomControl.alpha = 0.5;

    window.addEventListener('resize', () => {
      zoomControl.y = window.innerHeight / 2 - window.innerHeight / 3;
    });

    stage.addChild(zoomControl);
  };

  addListener(listener) {
    this.listeners.push(listener);
    listener.setScale(this.scale);
  };
}
