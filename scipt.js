let fortunes = ["大吉", "中吉", "小吉", "普通", "小凶"];

let started = false;

let angle = 0;
let speed = 0;
let spinning = false;

function setup() {
    createCanvas(500, 500);
}

function startGame() {
    document.getElementById("landing").style.display = "none";
    started = true;
}

function draw() {
    if (!started) return;

    background(240);

    translate(width / 2, height / 2);

    angle += speed;

    if (spinning) {
        speed *= 0.98;

        if (speed < 0.002) {
            speed = 0;
            spinning = false;
            showResult();
        }
    }

    rotate(angle);

    let section = TWO_PI / 5;

    let colors = ["#4CAF50", "#2196F3", "#FFC107", "#9C27B0", "#F44336"];

    for (let i = 0; i < 5; i++) {
        fill(colors[i]);
        arc(0, 0, 300, 300, i * section, (i + 1) * section, PIE);
    }
}

function keyPressed() {
    if (key === ' ' && !spinning && started) {
        speed = random(0.3, 0.4);
        spinning = true;
    }
}

function showResult() {
    let section = TWO_PI / 5;
    let finalAngle = TWO_PI - (angle % TWO_PI);
    let index = floor(finalAngle / section);

    document.getElementById("result").innerHTML =
        "今日運勢：" + fortunes[index];
}