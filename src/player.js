class Player {
    constructor(x, y, name, { up, down, left, right, reload }, shootFn) {
        // self
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 10;
        this.name = name;
        this.health = 100;

        // gun & bullet properties
        this.bulletTime = 0;
        this.bulletDamage = 15;
        this.hasCockBullet = true;
        this.magazine = 29;
        this.magCapacity = 30;
        this.ammo = 1000;
        this.isJam = false;
        // 0.2% jam rate ?
        this.jamRate = 0.002;
        this.isLoading = false;

        // Player control
        this.kb = { up, down, left, right, reload };
        this.shoot = shootFn;
        // this.shoot = () => mouseIsPressed;
        this.aim = () => createVector(0, 0);
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y
        };
    }
    set target(player) {
        this.aim = () => createVector(player.x - this.x, player.y - this.y);
    }
    targetMouse() {
        this.aim = () => createVector(mouseX - this.x, mouseY - this.y);
    }
    get isDead() {
        return this.health <= 0;
    }
    showInfo() {
        push();
        fill("blue");
        stroke(0);

        // Name display
        push();
        textSize(18);
        textAlign(CENTER);
        text(this.name, this.x, this.y - this.size * 2);

        // Dead or alive status
        fill("red");
        if (this.isDead) text("DEAD", this.x, this.y);
        pop();

        // For displaying time left and loading circle
        // reloadTime: 0 .. 2
        let reloadTime = (this.isLoading - Date.now()) / 1000;

        textSize(14);
        // Info display
        text(
            this.isLoading
                ? "Reloading\n" + reloadTime.toString() + " s"
                : (this.isJam ? "Jammed\n" : "Magazine\n") +
                      (this.magazine + this.hasCockBullet) +
                      "/" +
                      this.ammo,
            this.x + (this.size * 3) / 2,
            this.y + (this.size * 3) / 2
        );
        // Loading circle
        if (this.isLoading) {
            noFill();
            arc(
                this.x,
                this.y,
                (this.size * 5) / 2,
                (this.size * 5) / 2,
                -PI / 2,
                PI * reloadTime - PI / 2
            );
        }
        pop();
    }
    show() {
        push();
        fill("white");
        rectMode(CENTER);
        translate(this.x, this.y);
        rotate(this.aim().heading());
        // Body
        rect(0, 0, this.size, this.size);
        // Gun
        fill("black");
        rect(this.size / 2, 0, this.size, this.size / 5, 5);
        pop();
        this.showInfo();
    }
    updateMovement() {
        if (keyIsDown(this.kb.down)) {
            this.y += this.speed;
        } else if (keyIsDown(this.kb.up)) {
            this.y -= this.speed;
        }
        if (keyIsDown(this.kb.right)) {
            this.x += this.speed;
        } else if (keyIsDown(this.kb.left)) {
            this.x -= this.speed;
        }
        this.x = constrain(this.x, this.size, width - this.size);
        this.y = constrain(this.y, this.size, height - this.size);
    }
    shootBullet() {
        if (this.shoot()) {
            if (
                Date.now() > this.bulletTime &&
                this.magazine + this.hasCockBullet > 0 &&
                !this.isLoading &&
                !this.isJam
            ) {
                // Get bullet vector
                let bulletVector = this.aim();
                bulletVector.normalize();
                let bulletPosition = createVector(this.x, this.y).add(
                    bulletVector.mult(this.size)
                );
                // Bullet speed: 50 unit
                // Bullet spread: 0.08
                gameState.bullets.push(
                    new Bullet(
                        bulletPosition.x,
                        bulletPosition.y,
                        bulletVector,
                        10,
                        0.08
                    )
                );
                // ~ 600 RPM
                this.bulletTime = Date.now() + 100;
                if (this.magazine > 0) {
                    this.magazine -= 1;
                } else {
                    this.hasCockBullet = false;
                }

                // Jam randomizer
                let isNotJam = Math.floor(Math.random() / this.jamRate);
                this.isJam = !isNotJam;
            }
        }
    }
    reloadBullet() {
        // 2 seconds reloading
        if (
            !this.isLoading &&
            ((this.magazine < this.magCapacity && this.ammo > 0) || this.isJam)
        ) {
            let loadingTime = (2 + (this.isLoading ? 1 : 0)) * 1000;
            setTimeout(() => {
                // 30 + 1
                this.ammo -= -this.magazine;
                this.magazine =
                    this.ammo > this.magCapacity ? this.magCapacity : this.ammo;
                this.ammo -= this.magazine;
                this.isJam = false;
                if (!this.hasCockBullet) {
                    this.hasCockBullet = true;
                    this.magazine -= 1;
                }
                this.isLoading = false;
            }, 2000);
            this.isLoading = Date.now() + 2000;
        }
    }
    /*
    emptyBullet() {
        if ((this.magazine === 0 || this.isJam) && !this.isLoading) {
        }
    }
    */
    getShot() {
        gameState.bullets = gameState.bullets.filter((blt) => {
            // Calculate if bullet and player collide
            let isHit = collideCircleCircle(
                blt.x,
                blt.y,
                blt.size,
                this.x,
                this.y,
                this.size
            );
            if (isHit) {
                this.health -= this.bulletDamage;
                console.log(this.name + " is hit: " + blt.x + "," + blt.y);
            }
            return !isHit;
        });
    }
    update() {
        if (this.health > 0) {
            this.updateMovement();
            this.getShot();

            this.shootBullet();
            if (keyIsDown(this.kb.reload)) this.reloadBullet();
        }
    }
}
