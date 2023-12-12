class Vehicle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);

    this.r = 10;
    this.maxspeed = 2;
    this.maxforce = 2;

    this.offset = random(50);
    this.prevPosition = this.position.copy();
  }

  pursue(vehicle) {
    let target = vehicle.position.copy();

    let prediction = vehicle.velocity.copy();
    prediction.mult(10);
    target.add(prediction);

    fill(0, 255, 0);
    circle(target.x, target.y, 10);

    return this.seek(target);
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);

    return pursuit;
  }

  arrive(target) {
    let desired = p5.Vector.sub(target, this.position);

    let distance = desired.mag();
    let r = 100;

    if (distance < r) {
      let m = map(distance, 0, r, 0, this.maxspeed);
      desired.setMag(m);
    } else {
      desired.setMag(this.maxspeed);
    }

    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  show() {
    let angle = this.velocity.heading();
    fill(127);
    stroke(0);
    push();
    translate(this.position.x, this.position.y);
    rotate(angle);
    beginShape();
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    endShape(CLOSE);
    pop();
  }

  edges() {
    if (this.position.x > width + this.r) {
      this.position.x = -this.r;
    } else if (this.position.x < -this.r) {
      this.position.x = width + this.r;
    }
    if (this.position.y > height + this.r) {
      this.position.y = -this.r;
    } else if (this.position.y < -this.r) {
      this.position.y = height + this.r;
    }
  }
}
