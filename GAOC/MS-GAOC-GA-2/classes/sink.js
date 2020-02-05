class Sink {
    constructor (x, y, radius = 4) {
        this.pos = createVector (x, y);
        this.r = radius;
    }

    display () {
        fill (255, 0, 0);       // Red
        stroke (255, 0, 0);     // Red
        strokeWeight (2);
        ellipse (this.pos.x, this.pos.y, 2 * this.r, 2 * this.r);
    }
}