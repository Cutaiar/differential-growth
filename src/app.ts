import P5, { Vector } from "p5";
import "p5/lib/addons/p5.dom";

type Primitive = "circle";
class ClosedPath {
  public points: Vector[] = [];
  private p: P5;

  constructor(primitive: Primitive, p: P5) {
    this.p = p;
    if (primitive === "circle") {
      const r = 200;
      const step = (Math.PI * 2) / 100; //in radians equivalent of 360/6 in degrees
      const center = p.createVector(p.width / 2, p.height / 2);

      for (let angle = 0; angle < 360; ) {
        var x = r * Math.sin(angle) + center.x;
        var y = r * Math.cos(angle) + center.y;
        angle = angle + step;
        this.points.push(p.createVector(x, y));
      }
    }
  }

  public draw() {
    console.log(this.points);
    this.p.stroke(255);
    this.p.strokeWeight(4);
    this.points.forEach((p) => this.p.point(p.x, p.y));
    this.p.strokeWeight(0.3);

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

  p.setup = () => {
    console.log("🚀 - Setup initialized - P5 is running");

    p.createCanvas(p.windowWidth, p.windowHeight);

    cp = new ClosedPath("circle", p);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  p.draw = () => {
    p.background(0);
    cp.draw();
  };
};

new P5(sketch);
