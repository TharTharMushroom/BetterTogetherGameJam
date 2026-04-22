let player;
let projectiles = [];

function setup() {
  let canvas = createCanvas(750, 550);
  canvas.parent('main-game');
  player = new Clownfish();
}

function draw() {
  background("#007FFF");

  player.update();
  player.show();

  for (let i = projectiles.length - 1; i >= 0; i--) {
    projectiles[i].update();
    projectiles[i].show();
    if (!projectiles[i].active) projectiles.splice(i, 1);
  }
}

function keyPressed() {}

class Player {
  constructor() {
    this.x = 200;
    this.y = 300;
    this.w = 40;
    this.h = 40;
    this.vx = 0;
    this.vy = 0;
    this.accel = 0.8;
    this.friction = 0.9;
    this.facing = 0; 

    this.maxAmmo = 60;
    this.ammo = 60;
    this.ammoCost = 5;      
    this.rechargeRate = 0.25; 
    this.shootCooldown = 6; 
    this.shootTimer = 0;
  }

  update() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { this.vx -= this.accel; this.facing = 1; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { this.vx += this.accel; this.facing = 0; }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { this.vy -= this.accel; this.facing = 2; }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { this.vy += this.accel; this.facing = 3; }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;

    this.x = constrain(this.x, 0, width - this.w);
    this.y = constrain(this.y, 0, height - this.h);

    if (this.shootTimer > 0) this.shootTimer--;

    if ((keyIsDown(32) || keyIsDown(ENTER)) && this.shootTimer <= 0 && this.ammo >= this.ammoCost) {
      this.shoot();
    } else {
      this.ammo = min(this.maxAmmo, this.ammo + this.rechargeRate);
    }
  }

  // Base shoot (usually overridden by subclasses)
  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;
    let p = new Projectile(this.x + this.w / 2, this.y + this.h / 2, 0, 400, 10);
    projectiles.push(p);
  }

  // WE ADDED THIS SO CLOWNFISH CAN CALL IT
  showAmmoBar() {
    let barWidth = 100;
    let barHeight = 10;
    let xOffset = this.x - (barWidth - this.w) / 2;
    let yOffset = this.y - 15;

    fill(50);
    rect(xOffset, yOffset, barWidth, barHeight);
    fill(0, 255, 255);
    let currentBarWidth = map(this.ammo, 0, this.maxAmmo, 0, barWidth);
    rect(xOffset, yOffset, currentBarWidth, barHeight);
  }

  show() {
    fill(255, 100, 100);
    rect(this.x, this.y, this.w, this.h);
    this.showAmmoBar();
  }
}

class Clownfish extends Player {
  constructor() {
    super(); // Runs the Player constructor first
    
    // Preset Clownfish Attributes
    this.hp = 150;
    this.maxHp = 150;
    this.shootCooldown = 4;      // Faster fire rate
    this.ammoCost = 2;           // Cheaper shots
    this.projectileSpeed = 8;    // Slower, floaty bubbles
    this.projectileType = Bubble; // Assign the class itself
  }

  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;
    
    // Random angle between -5 and +5 degrees for a "wobble" effect
    let angle = random(-0.08, 0.08); 

    // Instantiate whatever projectile class is stored in this.projectileType
    let p = new Bubble(this.x + this.w / 2, 
    this.y + this.h / 2, 
    angle, 
    400,
    5);
    projectiles.push(p);
  }

  show() {
    // You can call super.show() or draw a custom fish shape here
    // Custom Clownfish Look:
    fill(255, 120, 0); // Orange
    rect(this.x, this.y, this.w, this.h, 10);
    fill(255); // White stripe
    rect(this.x + 15, this.y, 10, this.h);
    
    // Draw the ammo bar using the parent's logic
    super.showAmmoBar(); 
  }
}

class Projectile {
  constructor(x, y, angle, maxDist, speed) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.maxDist = maxDist;
    this.active = true;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (dist(this.startX, this.startY, this.x, this.y) > this.maxDist) this.active = false;
  }

  show() {
    // Default projectile look
    fill(255);
    ellipse(this.x, this.y, 5, 5);
  }
}

// Specific projectile for the Clownfish
class Bubble extends Projectile {
  constructor(x, y, angle, maxDist, speed) {
    super(x, y, angle, maxDist, speed);
  }

  show() {
    push();
    stroke(200, 255, 255);
    strokeWeight(1);
    fill(100, 200, 255, 150); // Transparent blue
    circle(this.x, this.y, 10);
    // Add a little "shine" highlight
    fill(255, 200);
    noStroke();
    circle(this.x - 2, this.y - 2, 3);
    pop();
  }
}
