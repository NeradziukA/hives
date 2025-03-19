import KeyboardListener from "../utils/KeyboardListener";

export default class TemplateScene {
  constructor(app, onSceneClose, isInteractive) {
    this.keyboardListeners = {};
    this.ctn = new PIXI.Container();
    this.ctn.visible = false;
    this.ctn.interactive = isInteractive;
    this.ctn.show = () => {
      for (let key in  this.keysPressHandlers) {
        let button = new KeyboardListener(key);
        button.press =  this.keysPressHandlers[key];
        this.keyboardListeners[key] = button;
      }
      this.ctn.visible = true;
    };
    this.ctn.hide = () => {
      for (let key in this.keyboardListeners) {
        this.keyboardListeners[key].unsubscribe();
      }
      this.ctn.visible = false;
    };
    app.stage.addChild(this.ctn);
  }

  setupKeyPressHandlers(keysPressHandlers) {
    this.keysPressHandlers = keysPressHandlers;
  }
}