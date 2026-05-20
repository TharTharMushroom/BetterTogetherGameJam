let player;
let projectiles = [];
let enemies = [];
let followers = [];
let wave = 0;
let gameState = "START"; // Can be "START", PLAYING", "SELECTING", or "GAMEOVER"
let choiceOptions = [];
let availableFishClasses;
let gameOver = false;

const fishDescriptions = {
  Clownfish:  "Fast, inacurrate bubbles. Great all-rounder.",
  Tuna:       "Slow, large, and powerful blasts. Great single-target.",
  Jellyfish:  "Stuns enemies on hit, stopping them from firing and moving. Great disruptor.",
  Mackerel:   "Triple spread shot. Great crowd control.",
  Turtle:     "Grants a small hp shield at certain intervals, but does not shoot. Great defensive support.",
  Anglerfish: "Inflicts vulnerability, making enemies receive bonus damage. Great offensive support.",
};

const fishImages = {
  Clownfish:  () => clownfishImg,
  Tuna:       () => tunaImg,
  Jellyfish:  () => jellyfishImg,
  Mackerel:   () => mackerelImg,
  Turtle:     () => turtleImg,
  Anglerfish: () => anglerImg,
};

function preload(){
    clownfishImg = loadImage('art/clownfish.png');
    jellyfishImg = loadImage('art/jellyfish.png');
    tunaImg = loadImage('art/tuna.png');
    mackerelImg = loadImage('art/mackerel.png');
    bottleImg = loadImage('art/bottle.png');
    shirtImg = loadImage('art/shirt.png');
    tireImg = loadImage('art/tire.png');
    oilImg = loadImage('art/oilProj.png');
    jellyShockImg = loadImage('art/jellyShock.png');
    turtleImg = loadImage('art/turtle.png');
    anglerImg = loadImage('art/anglerfish.png');
    anglerLightImg = loadImage('art/anglerLight.png');
    bgImg = loadImage('art/background.png');
}

function setup() {
  let canvas = createCanvas(750, 550);
  canvas.parent('main-game');
  
  player = new Clownfish();
  availableFishClasses = [Clownfish, Tuna, Jellyfish, Mackerel, Turtle, Anglerfish];
  enemies = []; 
 
  rectMode(CENTER);
}

function draw() {
  background("#007FFF");
    push();
    translate(0, 0);
    tint(100);
    image(bgImg, 0, 0, width, height);
     pop();
    if (gameState === "START") {
    showStartScreen();
    return; 
  }

  if (gameOver) {
    showGameOverScreen();
    return;
  }

  if (gameState === "SELECTING") {
    showSelectionScreen();
    return; 
  }

  // --- WAVE MANAGEMENT FIX ---
  if (enemies.length === 0 && gameState === "PLAYING") {
    if (wave === 0) {
      spawnWave(); // First wave starts automatically
    } else {
      prepareSelection(); // Subsequent waves trigger selection
      return;
    }
  }

  if (player.hp <= 0) {
    gameOver = true;
  }

  drawUI();

  player.update();
  player.show(255);

  // Projectile loop
  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].show();
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }

  // Enemy loop
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].show();
    if (!enemies[i].alive) enemies.splice(i, 1);
  }

  for (let f of followers) {
    f.update(player);
    f.show();
  }
  
  // Inside function draw()
if (player.shield > 0) {
  push();
  noFill();
  stroke(0, 255, 255, 150 + sin(frameCount * 0.1) * 50); // Pulsing effect
  strokeWeight(3);
  circle(player.x, player.y, player.w * 1.5);
  pop();
}
}

function keyPressed() {
  if (gameOver && (key === 'r' || key === 'R')) {
    resetGame();
  }
}

function resetGame() {
  wave = 0;
  gameOver = false;
  gameState = "PLAYING"; // Reset the state
  enemies = [];
  projectiles = [];
  followers = []; // Clear helpers
  player = new Clownfish();
}

function circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
  let closestX = constrain(cx, rx, rx + rw);
  let closestY = constrain(cy, ry, ry + rh);

  let dx = cx - closestX;
  let dy = cy - closestY;

  return (dx * dx + dy * dy) < (r * r);
}

function spawnWave() {
  wave++;
  
  // Determine how many enemies to spawn
  let count = wave + 2;

  for (let i = 0; i < count; i++) {
    let spawnX = random(width / 2, width - 50);
    let spawnY = random(50, height - 50);

    // Progressive Spawning Logic
    let r = random();
    
    if (wave >= 5 && r < 0.2) { 
      // 20% chance for a Tire after Wave 5
      enemies.push(new Tire(spawnX, spawnY));
    } else if (r < 0.6) {
      enemies.push(new Bottle(spawnX, spawnY));
    } else {
      enemies.push(new Shirt(spawnX, spawnY));
    }
  }
}

function drawUI() {
  fill(255);
  noStroke();
  textSize(20);
  textAlign(LEFT);
  text("Wave: " + wave, 20, 30);
  
  // HP Bar
  fill(255, 0, 0);
  rect(85, 50, 150, 15);
  fill(0, 0, 255);
  rect(85, 50, map(player.hp+Player.shield, 0, 100, 0, 100), 15);
  fill(0, 255, 0);
  rect(85, 50, map(player.hp, 0, 100, 0, 100), 15);

}

function showGameOverScreen() {
  fill(0, 150); // Dark overlay
  rect(width / 2, height / 2, width, height);

  fill(255);
  textAlign(CENTER);
  textSize(50);
  text("GAME OVER", width / 2, height / 2 - 20);
  
  textSize(20);
  text("You reached Wave " + wave, width / 2, height / 2 + 20);
  text("Press 'R' to Restart", width / 2, height / 2 + 60);
}

function prepareSelection() {
  gameState = "SELECTING";
  choiceOptions = [];
  
  // Pick 2 unique random fish classes from our list
  let shuffled = shuffle(availableFishClasses);
  choiceOptions = [shuffled[0], shuffled[1]];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showSelectionScreen() {
  fill(0, 170);
  rect(width / 2, height / 2, width, height);

  fill(255);
  textAlign(CENTER);
  textSize(32);
  textStyle(BOLD);
  text("WAVE CLEARED!", width / 2, height / 2 - 120);
  textStyle(NORMAL);
  textSize(16);
  fill(180, 230, 255);
  text("Choose a new ally fish:", width / 2, height / 2 - 85);

  let cardW = 170;
  let cardH = 200;
  let gap = 30;
  let totalW = choiceOptions.length * cardW + (choiceOptions.length - 1) * gap;
  let startX = width / 2 - totalW / 2 + cardW / 2;

  for (let i = 0; i < choiceOptions.length; i++) {
    let x = startX + i * (cardW + gap);
    let y = height / 2 + 30;
    let hovered = mouseX > x - cardW / 2 && mouseX < x + cardW / 2 &&
                  mouseY > y - cardH / 2 && mouseY < y + cardH / 2;
    drawFishCard(x, y, cardW, cardH, choiceOptions[i], hovered);
  }
}

function drawFishCard(x, y, cardW, cardH, FishClass, hovered) {
  let name = FishClass.name;
  let desc = fishDescriptions[name] || "A mysterious fish.";
  let img  = fishImages[name] ? fishImages[name]() : null;

  push();
  rectMode(CENTER);

  // Drop shadow
  fill(0, 100);
  noStroke();
  rect(x + 4, y + 6, cardW, cardH, 14);

  // Card background
  if (hovered) {
    fill(180, 230, 255, 230);
    stroke(100, 210, 255);
    strokeWeight(3);
  } else {
    fill(10, 40, 80, 210);
    stroke(60, 140, 200, 180);
    strokeWeight(1.5);
  }
  rect(x, y, cardW, cardH, 12);

  // Fish image
  let imgSize = 64;
  let imgY = y - cardH / 2 + imgSize / 2 + 14;
  if (img) {
    imageMode(CENTER);
    image(img, x, imgY, imgSize, imgSize);
  }

  // Name
  noStroke();
  textAlign(CENTER);
  textSize(15);
  textStyle(BOLD);
  fill(hovered ? color(20, 60, 100) : color(220, 230, 255));
  text(name, x, imgY + imgSize / 2 + 18);

  // Divider
  stroke(hovered ? color(80, 160, 220) : color(60, 100, 160));
  strokeWeight(1);
  line(x - cardW / 2 + 16, imgY + imgSize / 2 + 26,
       x + cardW / 2 - 16, imgY + imgSize / 2 + 26);

  // Description
  noStroke();
  textStyle(NORMAL);
  textSize(11);
  fill(hovered ? color(30, 80, 120) : color(160, 200, 240));
  text(desc, x, imgY + imgSize / 2 + 64, cardW - 20, 60);

  pop();
}

function mousePressed() {
  if (gameState === "START") {
    gameState = "PLAYING";
    return;
  }

  if (gameState === "SELECTING") {
    let cardW = 170;
    let cardH = 200;
    let gap = 30;
    let totalW = choiceOptions.length * cardW + (choiceOptions.length - 1) * gap;
    let startX = width / 2 - totalW / 2 + cardW / 2;

    for (let i = 0; i < choiceOptions.length; i++) {
      let x = startX + i * (cardW + gap);
      let y = height / 2 + 10;

      if (mouseX > x - cardW / 2 && mouseX < x + cardW / 2 &&
          mouseY > y - cardH / 2 && mouseY < y + cardH / 2) {
        addFollower(choiceOptions[i]);
        gameState = "PLAYING";
        spawnWave();
      }
    }
  }
}

function showStartScreen() {
  // Darken the background slightly
  fill(0, 100);
  rect(width / 2, height / 2, width, height);

  textAlign(CENTER);
  fill(255);
  
  // Title
  textSize(60);
  text("FISHY FRENZY", width / 2, height / 2 - 50);
  
  // Instructions
  textSize(20);
  text("WASD or Arrows to Move", width / 2, height / 2 + 20);
  text("Space or Enter to Shoot", width / 2, height / 2 + 50);
  
  // Prompt
  textSize(25);
  fill(255, 255, 0); // Yellow to make it pop
  text("Click Anywhere to Start", width / 2, height / 2 + 120);
}

function addFollower(FishClass) {
  // Angle them out so they don't overlap (spacing them by 60 degrees)
  let angleOffset = followers.length * 1.0; 
  followers.push(new FollowerFish(angleOffset, 70, FishClass));
}
