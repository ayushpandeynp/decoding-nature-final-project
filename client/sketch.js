let x, y, prevX, prevY;
let network;
let loading;
let targetIndex;
let elapsed;

let wh = 600;

const diameter = 140;
const radius = diameter / 2;

let dragging = false;

function setup() {
  createCanvas(windowWidth, wh);

  network = new Network("wss://dn-server.onrender.com");
  let callback = (data) => {
    targetIndex = data;
  };

  loading = true;
  elapsed = 0;

  x = width / 2;
  y = height / 2;

  prevX = x;
  prevY = y;

  network.connect(callback).then(() => {
    loading = false;
  });
}

function draw() {
  background(0);

  if (targetIndex) {
    fill(255);
    textSize(22);
    textAlign(LEFT, TOP);
    text(
      `T${targetIndex} [${windowWidth} ${wh}]\nRotate your phone or drag the circle to interact.`,
      30,
      30
    );
  }

  if (loading) {
    fill(255);
    textSize(30);
    textAlign(CENTER, TOP);
    text(`Loading...`, width / 2, height / 2);
    return;
  }

  fill(230, 199, 48);

  if (!dragging) {
    x += rotationY * 0.1;
    y += rotationX * 0.1;
  } else {
    x = mouseX;
    y = mouseY;
  }

  ellipse(x, y, diameter, diameter);

  x = constrain(x, radius / 2, width - radius);
  y = constrain(y, radius / 2, height - radius);

  sendData();

  prevX = x;
  prevY = y;
}

function mousePressed() {
  let d = dist(mouseX, mouseY, x, y);
  if (d < radius) {
    dragging = true;
  }
}

function mouseReleased() {
  dragging = false;
}

function sendData() {
  if ((prevX != x || prevY != y) && millis() - elapsed > 100) {
    network.sendPosition((x / windowWidth).toFixed(2), (y / wh).toFixed(2));
    elapsed = millis();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, wh);
}
