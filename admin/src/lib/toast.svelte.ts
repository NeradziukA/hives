let _message = $state('');
let _isError = $state(false);
let _visible = $state(false);
let _timer: ReturnType<typeof setTimeout> | null = null;

export const toast = {
  get message() { return _message; },
  get isError() { return _isError; },
  get visible() { return _visible; },

  show(msg: string, isErr = false) {
    _message = msg;
    _isError = isErr;
    _visible = true;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(() => {
      _visible = false;
    }, 2500);
  },
};
