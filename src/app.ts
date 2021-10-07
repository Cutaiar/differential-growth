import P5, { Vector } from "p5";
import "p5/lib/addons/p5.dom";

type Primitive = "circle";

type Point = {
  pos: Vector;
  vel: Vector;
  acc: Vector;
};

const createPoint = (p: P5, x?: number, y?: number) => {
  return {
    pos: p.createVector(x ?? 0, y ?? 0),
    vel: p.createVector(0, 0),
    acc: p.createVector(0, 0),
  };
};

class ClosedPath {
  public points: Point[] = [];
  private p: P5;

  constructor(primitive: Primitive, p: P5) {
    this.p = p;

    // Math to construct a circle of points
    if (primitive === "circle") {
      const numPoints = 5; // only some number of points work well. Some numbers will produce overlapping points. Try 24.
      const r = 100;
      const step = (Math.PI * 2) / numPoints;
      const center = p.createVector(p.width / 2, p.height / 2);

      for (let angle = 0; angle < Math.PI * 2; angle += step) {
        var x = r * Math.sin(angle) + center.x;
        var y = r * Math.cos(angle) + center.y;

        this.points.push(createPoint(this.p, x, y));
      }
    }
  }

  // Just move the points around randomly
  private applyRandomVel(scale?: number) {
    const _scale = scale ?? 1;
    this.points.forEach((p) => {
      const rand = P5.Vector.random2D();
      p.vel.set(rand.x * _scale, rand.y * _scale);
    });
  }

  // Apply repulsion force to a, considering b.
  private repulse(a: Point, b: Point, scale?: number) {
    const _scale = scale ?? 1;
    const G = 1.5;
    const dir = Vector.sub(b.pos, a.pos).mult(-1);
    const dsq = dir.magSq();
    const strength = (G * _scale) / dsq;
    dir.setMag(strength);
    a.acc.add(dir);
  }

  // Subdivide the line between two points a and b. index should be the index of b
  private subdivide(index: number, a: Point, b: Point) {
    const halfDir = Vector.add(b.pos, a.pos).mult(0.5);
    this.points.splice(index, 0, createPoint(this.p, halfDir.x, halfDir.y));
  }

  // Find the first case for subdivison and do it. This should be called in tick
  private subdivision() {
    const distBreak = 100;
    for (let i = 0; i < this.points.length - 1; i++) {
      const j = i + 1;
      const a = this.points[i];
      const b = this.points[j];

      if (Vector.dist(b.pos, a.pos) > distBreak) {
        this.subdivide(j, a, b);
        break;
      }
    }

    // Handle last-first point connection
    // TODO: can this be cleaner?
    const a = this.points[this.points.length - 1];
    const b = this.points[0];
    if (Vector.dist(b.pos, a.pos) > distBreak) {
      this.subdivide(this.points.length, a, b);
    }
  }

  public tick() {
    this.points.forEach((p) => {
      // apply repulsion to every point
      for (const q of this.points) {
        if (p !== q) {
          this.repulse(p, q);
        }
      }

      // Physics point update
      p.pos.add(p.vel);
      p.vel.add(p.acc);
    });

    this.subdivision();
  }

  public draw() {
    // Stroke style for points
    this.p.stroke(255);
    this.p.strokeWeight(4);

    // Draw each point with point
    this.points.forEach((p) => this.p.point(p.pos.x, p.pos.y));

    // Stoke style for lines
    this.p.strokeWeight(0.3);

    // Draw lines with line
    for (let i = 0; i < this.points.length - 1; i++) {
      const j = i + 1;
      const firstPoint = this.points[i];
      const secondPoint = this.points[j];
      vline(this.p, firstPoint.pos, secondPoint.pos);
    }
    vline(this.p, this.points[this.points.length - 1].pos, this.points[0].pos);
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
  var paused = false;
  // todo: type
  const keyPressActionMap = {
    " ": () => {
      paused = !paused;
      paused ? p.noLoop() : p.loop();
    },
    s: () => {
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

const vline = (p: P5, a: Vector, b: Vector) => {
  p.line(a.x, a.y, b.x, b.y);
};
