const PIXI = require('../vendors/pixi/pixi.min.js');
import Cons from "./widgets/console";
import SceneSelector from './utils/SceneSelector';
import Intro from './scenes/Intro';
import Login from './scenes/Login/index';
import Menu from './scenes/Menu/index';
import Map from './scenes/Map/index';

export default class Incuby {
  constructor() {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      antialias: true,
      transparent: false,
      resolution: 1
    });
    this.app.renderer.autoResize = true;
    this.app.renderer.backgroundColor = 0x000000;
    this.app.renderer.view.style.position = "absolute";
    this.app.view.style.display = "block";
    this.app.ticker.add(delta => this.gameLoop(delta));
    this.console = new Cons(this.app.renderer, this.app.stage);

    document.body.appendChild(this.app.view);
    window.addEventListener('resize', () => {
      let w = window.innerWidth;
      let h = window.innerHeight;
      this.app.renderer.resize(w, h);
    });

    PIXI.loader.add([
      'video/SampleVideo_1280x720_1mb.mp4',
      'img/background.jpg',
      'img/plus_green.png',
      'img/minus_green.png',
      'img/z_player.png',
      'img/z_m1_32x70.png',
      'img/build_z1_85x70.png',
      'img/build_h1_85x70.png',
    ]).load(this.init.bind(this));

    return this;
  };

  init() {
    this.sceneSelector = new SceneSelector({
      'intro': new Intro(this.app, () => this.onIntroClose()),
      'login': new Login(this.app, () => this.onLoginClose()),
      'menu': new Menu(this.app, (sceneName) => this.onButtonClick(sceneName)),
      'map': new Map(this.app, (sceneName) => this.onButtonClick(sceneName))
    });
    this.sceneSelector.showScene('intro');
  }

  gameLoop(delta) {}

  onIntroClose() {
    this.sceneSelector.showScene('login');
  }

  onLoginClose() {
    this.sceneSelector.showScene('menu');
  }

  onButtonClick(sceneName) {
    this.sceneSelector.showScene(sceneName);
  }
}
