import form from './menu.html';

export default class Menu {
  constructor(app, onSceneClose) {
    this.show = () => {
      this.form = document.createElement('form');
      this.form.id = 'menu-form';
      this.form.innerHTML = form;
      [...this.form.querySelectorAll('.screen-selector')].map(e => {
        e.onclick = (ev) => {
          ev.preventDefault();
          onSceneClose(e.dataset.scene_name);
        };
      });

      document.querySelector('body').appendChild(this.form);
    };

    this.hide = () => {
      if (this.form) this.form.remove();
    };
    return this;
  };
}
