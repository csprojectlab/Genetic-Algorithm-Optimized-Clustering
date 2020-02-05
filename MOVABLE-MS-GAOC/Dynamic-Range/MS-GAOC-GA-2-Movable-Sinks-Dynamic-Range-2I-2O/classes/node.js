class Node {
    constructor (x, y, energy, type = NODE_TYPE.NRM) {
        this.pos = createVector (x, y);
        this.maxEnergy = energy;
        this.resEnergy = energy;
        this.vicinity = 0;
        this.type = type;
    }

    adjustSensingRange (d_sink, d_max, d_min) {     // NEECP formula
        this.vicinity = (1 - ((d_max - d_sink) / (d_max - d_min))) * VICINITY;
    }

    // TODO(Ari): Add vicinity feature to node display
    display (isCH = 0) {
        noFill ();
        if (isCH) {
            stroke (0);
            strokeWeight (0.3)
            ellipse (this.pos.x, this.pos.y, 2 * this.vicinity);
            fill (0, 255, 0);
        }
        stroke (0);
        strokeWeight (0.3);
        switch (this.type) {
            case NODE_TYPE.NRM:
                ellipse (this.pos.x, this.pos.y, 3, 3);
                break;
            case NODE_TYPE.INT:
                rect (this.pos.x, this.pos.y, 3, 3);
                break;
            case NODE_TYPE.ADV:
                triangle (this.pos.x, this.pos.y, this.pos.x - 2, this.pos.y + 2, this.pos.x + 2, this.pos.y + 2);
                break;
        }
    }  // End of display



}