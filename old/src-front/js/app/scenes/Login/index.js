import loginForm from './login-form.html';

export default class Login {
  constructor(app, onSceneClose) {
    this.show = () => {
      this.loginForm = document.createElement('form');
      this.loginForm.id = 'login-form';
      this.loginForm.innerHTML = loginForm;
      this.loginForm.querySelector('#login-button').onclick = (ev) => {
        ev.preventDefault();
        onSceneClose();
      };

      document.querySelector('body').appendChild(this.loginForm);
    };

    this.hide = () => {
      if (this.loginForm) this.loginForm.remove();
    };

    return this;
  };
}
