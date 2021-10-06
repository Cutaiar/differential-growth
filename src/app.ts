import P5, { Vector } from "p5";
import "p5/lib/addons/p5.dom";

type Primitive = "circle";
class ClosedPath {
  public points: Vector[] = [];
  private p: P5;

  constructor(primitive: Primitive, p: P5) {
    this.p = p;

    // Math to construct a circle of points
    if (primitive === "circle") {
      const numPoints = 10;
      const r = 200;
      const step = (Math.PI * 2) / numPoints; //in radians equivalent of 360/6 in degrees
      const center = p.createVector(p.width / 2, p.height / 2);

      for (let angle = 0; angle < 360; ) {
        var x = r * Math.sin(angle) + center.x;
        var y = r * Math.cos(angle) + center.y;

        this.points.push(p.createVector(x, y));

        angle += step;
      }
    }
  }

  // Just move the points around randomly
  private applyRandomMovement(scale?: number) {
    const _scale = scale ?? 1;
    this.points = this.points.map((p) => {
      const rand = P5.Vector.random2D();
      return this.p.createVector(p.x + rand.x * _scale, p.y + rand.y * _scale);
    });
  }

  public tick() {
    // Temporarily just move the points randomly
    this.applyRandomMovement(0.5);
  }

  public draw() {
    // Stroke style for points
    this.p.stroke(255);
    this.p.strokeWeight(4);

    // Draw each point with point
    this.points.forEach((p) => this.p.point(p.x, p.y));

    // Stoke style for lines
    this.p.strokeWeight(0.3);

    // Draw lines with line
    // todo, do declaratively
    for (let i = 0; i < this.points.length - 1; i++) {
      const j = i + 1;
      const firstPoint = this.points[i];
      const secondPoint = this.points[j];
      this.p.line(firstPoint.x, firstPoint.y, secondPoint.x, secondPoint.y);
    }
  }
}

var sketch = (p: P5) => {
  let cp: ClosedPath;
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight);

    // Make a new closed path
    cp = new ClosedPath("circle", p);
  };

  // Enable pause with space
  let paused = false;
  // todo: type
  const keyPressActionMap = {
    " ": () => {
      paused = !paused;
      paused ? p.noLoop() : p.loop();
    },
    r: () => {
      p.saveCanvas(canvas, "render" + guid(), "png");
    },
  };

  p.keyPressed = () => keyPressActionMap[p.key]?.();

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(0);

    // Update closed path...
    cp.tick();

    // Then draw it
    cp.draw();
  };
};

new P5(sketch);

//https://editor.p5js.org/Bassam/sketches/f-7MtZNPW
const guid = () => {
  //someone else's function
  //https://slavik.meltser.info/the-efficient-way-to-create-guid-uuid-in-javascript-with-explanation/
  function _p8(s?) {
    var p = (Math.random().toString(16) + "000000000").substr(2, 8);
    return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
  }
  return _p8() + _p8(true) + _p8(true) + _p8();
};
