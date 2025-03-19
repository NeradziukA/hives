export default class SceneSelector {
  constructor(scenes) {
    this.scenes = scenes;
    return this;
  }

  showScene(sceneName) {
    for (let key in this.scenes) {
      if (key === sceneName) {
        this.scenes[key].show();
      } else {
        this.scenes[key].hide();
      }
    }
  }
}