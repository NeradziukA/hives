export default class Connect {
  constructor(url) {
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('Connected to server.');
    };

    this.socket.onclose = (event) => {
      console.log('Disconnected from server.');
    };

    this.socket.onmessage = (event) => {
      console.log('Message from server.');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error.');
    };
  }
}