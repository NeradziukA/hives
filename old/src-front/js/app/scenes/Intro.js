import TemplateScene from './TemplateScene';
import form from "./Menu/menu.html";

export default class Intro extends TemplateScene {
  constructor(app, onSceneClose) {
    super(app, onSceneClose, true);

    // let rectangle = new PIXI.Graphics();
    // rectangle.lineStyle(4, 0xFF3300, 1);
    // rectangle.beginFill(0x66CC00);
    // rectangle.drawRect(0, 0, 64, 64);
    // rectangle.endFill();
    // rectangle.x = 170;
    // rectangle.y = 170;
    // // let video = PIXI.Texture.fromVideo('video/SampleVideo_1280x720_1mb.mp4');
    // // let videoSprite = new PIXI.Sprite(video);
    // // videoSprite.width = window.innerWidth;
    // // videoSprite.height = window.innerWidth * 0.56;
    //
    // // this.addChild(videoSprite);
    // this.ctn.addChild(rectangle);
    //
    // this.ctn.click = onSceneClose;
    // this.ctn.tap = onSceneClose;
    //
    // this.setupKeyPressHandlers({
    //   ' ': onSceneClose
    // });

    this.ctn.show = () => {
      this.layer = document.createElement('button');
      this.layer.id = 'intro';

      this.layer.onclick = (ev) => {
        ev.preventDefault();
        onSceneClose();
      };

      this.layer.onkeypress = (ev) => {
        ev.preventDefault();
        onSceneClose();
      };

      document.querySelector('body').appendChild(this.layer);
      this.layer.focus();
    };

    this.ctn.hide = () => {
      app.stage.visible = true;
      if (this.layer) this.layer.remove();
    };

    return this.ctn;
  };
}
