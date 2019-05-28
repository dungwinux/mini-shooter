const gameState = {
    bullets: [],
    isPaused: false
};

function setup() {
    createCanvas(600, 600);
    gameState.player1 = new Player(
        width - 200,
        height - 200,
        "Player 1",
        {
            up: UP_ARROW,
            down: DOWN_ARROW,
            right: RIGHT_ARROW,
            left: LEFT_ARROW,
            reload: 191
        },
        () => keyIsDown(190)
    );
    gameState.player2 = new Player(
        200,
        200,
        "Player 2",
        {
            up: 87,
            down: 83,
            left: 65,
            right: 68,
            reload: 72
        },
        () => keyIsDown(71)
    );
    gameState.player1.target = gameState.player2;
    gameState.player2.target = gameState.player1;
}

function draw() {
    background(220);

    gameState.player1.show();
    gameState.player2.show();
    gameState.bullets.forEach((x) => x.show());
    push();
    let fps = frameRate();
    fill(255);
    stroke(0);
    text("FPS: " + fps.toFixed(2), 10, height - 10);
    pop();

    if (gameState.player2.isDead || gameState.player1.isDead) {
        push();
        fill("Yellow");
        textAlign(CENTER);
        textSize(60);

        let textStr;
        if (gameState.player1.isDead && gameState.player2.isDead)
            textStr = "Draw";
        else if (gameState.player1.isDead) textStr = "Player 2 Win";
        else if (gameState.player2.isDead) textStr = "Player 1 Win";
        text(textStr, width / 2, height / 2);
        pop();
        return;
    }

    gameState.player1.update();
    gameState.player2.update();
    gameState.bullets.forEach((x) => x.update());
    gameState.bullets = gameState.bullets.filter((b) => b.isInView());
}

// function mousePressed() {
//     gameState.player1.emptyBullet();
//     gameState.player2.emptyBullet();
// }
