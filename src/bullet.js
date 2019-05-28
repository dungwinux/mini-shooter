class Bullet {
    constructor(x, y, vector, speed, spread) {
        this.x = x;
        this.y = y;
        this.size = 4;

        this.vector = vector;
        this.vector.normalize();

        this.spread = p5.Vector.random2D().mult(spread);

        this.vector = this.vector.add(this.spread);
        this.vector.normalize();

        this.vector = this.vector.mult(speed);

        // Debug
        this.isStop = false;
    }

    show() {
        fill(Math.random() * 255, Math.random() * 255, Math.random() * 255);
        circle(this.x, this.y, this.size);
    }

    update() {
        this.x = this.x + this.vector.x;
        this.y = this.y + this.vector.y;
    }

    isInView() {
        // Remove bullet in case of out of view
        return this.x > 0 && this.x < width && this.y > 0 && this.y < height;
    }
    stop() {
        this.vector = createVector(0, 0);
        this.isStop = true;
    }
}
