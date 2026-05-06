let player;
let projectiles = [];
let enemies = [];
let followers = [];
let wave = 0;
let gameState = "START"; // Can be "START", PLAYING", "SELECTING", or "GAMEOVER"
let choiceOptions = [];
let availableFishClasses;
let gameOver = false;

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
    bgImg = loadImage('art/background.png');
}

function setup() {
  let canvas = createCanvas(750, 550);
  canvas.parent('main-game');
  
  player = new Clownfish();
  availableFishClasses = [Clownfish, Tuna, Jellyfish, Mackerel];
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
  player.show();

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
  rect(120, 50, 150, 15);
  fill(0, 255, 0);
  rect(120, 50, map(player.hp, 0, 100, 0, 100), 15);

  // --- NEW SHIELD BAR ---
  if (player.shield > 0) {
    fill(0, 200, 255);
    rect(70, 70, map(player.shield, 0, 20, 0, 100), 10);
    text("SHIELD", 130, 78);
  }
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
  let shuffled = availableFishClasses.sort(() => 0.5 - random());
  choiceOptions = [shuffled[0], shuffled[1]];
}

function showSelectionScreen() {
  fill(0, 150);
  rect(width / 2, height / 2, width, height);

  fill(255);
  textAlign(CENTER);
  textSize(30);
  text("WAVE CLEARED!", width / 2, height / 2 - 100);
  textSize(20);
  text("Choose a new helper fish:", width / 2, height / 2 - 60);

  // Draw two buttons/boxes for choices
  for (let i = 0; i < choiceOptions.length; i++) {
    let x = width / 2 - 100 + (i * 200);
    let y = height / 2;
    
    fill(255, 200);
    if (mouseX > x - 80 && mouseX < x + 80 && mouseY > y - 50 && mouseY < y + 50) {
      fill(255); // Highlight on hover
    }
    rect(x, y, 160, 100, 10);
    
    fill(0);
    text(choiceOptions[i].name, x, y + 5);
  }
}

function mousePressed() {
  // START -> PLAYING
  if (gameState === "START") {
    gameState = "PLAYING";
    return; // Stop here so we don't accidentally click a selection button
  }

  // Existing SELECTING logic
  if (gameState === "SELECTING") {
    for (let i = 0; i < choiceOptions.length; i++) {
      let x = width / 2 - 100 + (i * 200);
      let y = height / 2;
      
      if (mouseX > x - 80 && mouseX < x + 80 && mouseY > y - 50 && mouseY < y + 50) {
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
  text("FISHING FRENZY", width / 2, height / 2 - 50);
  
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
