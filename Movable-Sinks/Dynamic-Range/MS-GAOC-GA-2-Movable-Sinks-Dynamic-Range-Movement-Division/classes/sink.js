class Sink {
    generatePositions (r, start_angle = 0, end_angle = TWO_PI, reverse = false) {        
        for (let a = start_angle; a < end_angle; a += 0.02) {   
            let x = r * cos (a) + X + X / 2;
            let y = r * sin (a) + Y + Y / 2;
            this.points.push (createVector(x, y));
        }
        // Sink.points.forEach ((p, i) => console.log(i, p.x, p.y))
        return this;
    }
    constructor (x, y, radius = 4, index = 0) {
        this.pos = createVector (x, y);
        this.r = radius;
        this.index = index;
        this.points = [];
        return this;
    }

    update (speed = 1) {
        this.index = ceil(this.index + speed) % this.points.length;
        if (this.index == 0)
            this.points.reverse();
        this.pos.x = this.points[this.index].x;
        this.pos.y = this.points[this.index].y;
    }

    display () {
        fill (255, 0, 0);       // Red
        stroke (255, 0, 0);     // Red
        strokeWeight (2);
        ellipse (this.pos.x, this.pos.y, 2 * this.r, 2 * this.r);
    }
}
