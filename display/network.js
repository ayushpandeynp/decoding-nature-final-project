class Network {
  constructor(url) {
    this.url = url;
    this.websocket = null;
  }

  connect(successCallback) {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(this.url);

      this.websocket.onopen = () => {
        console.log("Connected to server");
        resolve();
      };

      this.websocket.onerror = (error) => {
        console.error("Connection error:", error);
        reject(error);
      };

      this.websocket.onmessage = (event) => {
        if (successCallback) {
          successCallback(event.data);
        }
      };
    });
  }

  sendMsg(msg) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(msg);
    } else {
      console.error("WebSocket is not connected.");
    }
  }

  sendPosition(x, y) {
    const position = `${x},${y}`;
    this.sendMsg(position);
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      console.log("Disconnected from server");
    }
  }
}
