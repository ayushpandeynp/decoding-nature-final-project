let vehicles = [];
let targets = [];

const numVehicles = 40;
const arrivalThreshold = 20;

let network;
let networkConnected = false;
let loadingVisible = true;

let latestData = null;

let img;

const QRMargin = 20;
const imgSize = 150;

function preload() {
  img = loadImage("qrcode.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB);

  for (let i = 0; i < numVehicles; i++) {
    let vehicle = new Vehicle(random(width), random(height));
    vehicles.push(vehicle);
  }

  configureNetwork();

  document.getElementById("refresh").onclick = () => {
    network.sendMsg("REFRESH");

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  img = loadImage("qrcode.png");
}

function configureNetwork() {
  network = new Network("wss://dn-server.onrender.com");

  const callback = (data) => {
    if (data === "BROWSER") {
      return;
    }

    latestData = JSON.parse(data);

    const safeKeys = Object.keys(latestData);
    const totalTargets = safeKeys.length;

    for (let i = targets.length - 1; i >= 0; i--) {
      const [x, y] = latestData[(i + 1).toString()].split(",");
      targets[i] = createVector(x * windowWidth, y * windowHeight);
    }

    if (targets.length < totalTargets) {
      for (let i = targets.length; i < totalTargets; i++) {
        const [x, y] = latestData[(i + 1).toString()].split(",");
        targets.push(createVector(x * windowWidth, y * windowHeight));
      }
    }
  };

  network.connect(callback).then(() => {
    networkConnected = true;
  });
}

function draw() {
  if (frameCount === 1) {
    background(0);
  }

  if (!networkConnected) {
    textAlign(CENTER);
    textSize(32);
    fill(255);
    text("Connecting...", width / 2, height / 2);
    return;
  }

  if (loadingVisible) {
    background(0);
    loadingVisible = false;
  }

  if (targets.length === 0) {
    renderQRCode();
    return;
  }

  background(0, 0, 0, 0.008);

  for (let i = vehicles.length - 1; i >= 0; i--) {
    let vehicle = vehicles[i];

    let closestTarget = targets[0];
    let shortestDistance = p5.Vector.dist(vehicle.position, closestTarget);

    for (let target of targets) {
      let distance = p5.Vector.dist(vehicle.position, target);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestTarget = target;
      }
    }

    let steering = vehicle.arrive(closestTarget);
    vehicle.applyForce(steering);
    vehicle.edges();
    vehicle.update();

    let time = millis();
    let colorHue = noise(time * 0.001, vehicle.velocity.heading() * 0.01) * 255;
    let weight = map(
      vehicle.velocity.mag(),
      0,
      vehicle.maxspeed,
      1,
      vehicle.offset
    );

    if (shortestDistance < arrivalThreshold) {
      vehicle.position = createVector(random(width), random(height));
      vehicle.prevPosition = vehicle.position.copy();
    } else {
      strokeWeight(weight);
      stroke(colorHue, 360, 360, 0.5);
      line(
        vehicle.prevPosition.x,
        vehicle.prevPosition.y,
        vehicle.position.x,
        vehicle.position.y
      );
    }

    vehicle.prevPosition = vehicle.position.copy();
  }

  renderQRCode();
}

function renderQRCode() {
  image(
    img,
    windowWidth - QRMargin - imgSize,
    windowHeight - QRMargin - imgSize,
    imgSize,
    imgSize
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

function keyPressed() {
  if (key === "p") {
    noLoop();
  } else if (key === "r") {
    loop();
  }
}
