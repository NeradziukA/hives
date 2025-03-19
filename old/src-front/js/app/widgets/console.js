export default class Cons {
    constructor(renderer, stage) {
        this.MESSAGE_SIZE = 500;
        // this.BUFFER_SIZE = 500;
        // this.message = new PIXI.Text(
        //     "Hello!",
        //     {font: "12px Arial", fill: "#FFFFFF"}
        // );
        // this.message.x = 5;
        // this.message.y = renderer.view.height - 30;
        // this.buffer = [];
        //
        // window.addEventListener('resize', () => {
        //     incubyApp.console.message.y = window.innerHeight - 30;
        // });
        //
        // stage.addChild(this.message);
    };

    addMessage(message) {
        if (message.length > this.MESSAGE_SIZE) {
            return console.error('Too big message.')
        }
        //this.buffer.push(message);
        //if (this.buffer.length > BUFFER_SIZE) {
        //    this.buffer.shift();
        //}
        //
        //this.message.text = this.buffer.join('\n');
        // this.message.text = message;
        console.log(`%c${message}`, "color: green");
    };
}
