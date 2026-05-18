class Player {

  static shield = 0;

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
    this.hp = 100;
    this.shield = 0;
    this.maxAmmo = 60;
    this.ammo = 60;
    this.ammoCost = 5;      
    this.rechargeRate = 0.25; 
    this.shootCooldown = 6; 
    this.shootTimer = 0;

  }

  update() {
  if (this.frozen) return;
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { this.vx -= this.accel; this.facing = 1; }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { this.vx += this.accel; this.facing = 0; }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { this.vy -= this.accel; this.facing = 2; }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { this.vy += this.accel; this.facing = 3; }

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;

    this.x = constrain(this.x, this.w/2, width - this.w/2);
    this.y = constrain(this.y, this.h/2, height - this.h/2);

    if (this.shootTimer > 0) this.shootTimer--;

    if ((keyIsDown(32) || keyIsDown(ENTER)) && this.shootTimer <= 0 && this.ammo >= this.ammoCost) {
      this.shoot();
    } else {
      this.ammo = min(this.maxAmmo, this.ammo + this.rechargeRate);
    }
  }
    
    takeDamage(dmg) {
    if(Player.shield > 0){
      Player.shield -= dmg;
    }else{
      this.hp -= dmg;
    }
    if (this.hp < 0) this.hp = 0;
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
      if (this.frozen) return;
    let barWidth = 100;
    let barHeight = 10;
    let xOffset = this.x;
    let yOffset = this.y - 15;
    push();
    rectMode(CENTER);
    fill(50);
    rect(xOffset, yOffset, barWidth, barHeight);
    fill(0, 255, 255);
    let currentBarWidth = map(this.ammo, 0, this.maxAmmo, 0, barWidth);
    rect(xOffset, yOffset, currentBarWidth, barHeight);
    pop();
  }

  show() {
    fill(255, 100, 100);
    rect(this.x, this.y, this.w, this.h);
    this.showAmmoBar();
  }
}
class Projectile {
  constructor(x, y, angle, maxDist, speed) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.r = 5;
    this.angle = angle || 0; // Fallback to 0 to prevent NaN
    this.speed = speed || 0; // Fallback to 0 to prevent NaN
    this.maxDist = maxDist;
    this.active = true;
    
    // Use Math instead of p5 functions inside constructors for stability
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    
    this.effects = [];
    this.damage = 5;
    this.owner = "player";
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (dist(this.startX, this.startY, this.x, this.y) > this.maxDist) {
      this.active = false;
    }
  }

  show() {
    fill(255);
    noStroke();
    circle(this.x, this.y, this.r * 2);
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
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(clownfishImg, 0, 0, this.w, this.h);

     pop();
    
    // Draw the ammo bar using the parent's logic
    super.showAmmoBar(); 
  }
}

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

class Tuna extends Player {
  constructor() {
    super();
    this.hp = 200;
    this.maxHp = 200;

    this.shootCooldown = 20;
    this.ammoCost = 10;
  }

  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;

    let p = new TunaBlast(
      this.x + this.w / 2,
      this.y + this.h / 2,
      0,
      500,
      4
    );
    projectiles.push(p);
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(tunaImg, 0, 0, this.w, this.h);

     pop();
    super.showAmmoBar();
  }
}

class TunaBlast extends Projectile {
  constructor(x, y, angle, maxDist, speed) {
    super(x, y, angle, maxDist, speed);
    this.r = 20;
    this.damage = 10;
  }

  show() {
    fill(180, 180, 255, 180);
    circle(this.x, this.y, this.r);
  }

  // later: explode into AOE damage
}

class Jellyfish extends Player {
  constructor() {
    super();
    this.hp = 100;
    this.maxHp = 100;

    this.shootCooldown = 18;
    this.ammoCost = 6;
  }

  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;

    let p = new JellyShock(
      this.x + this.w / 2,
      this.y + this.h / 2,
      0,
      400,
      3
    );
    projectiles.push(p);
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(jellyfishImg, 0, 0, this.w, this.h);

     pop();
    super.showAmmoBar();
  }
}

class JellyShock extends Projectile {
  constructor(x, y, angle, maxDist, speed) {
    super(x, y, angle, maxDist, speed);
    this.effects.push(new StatusEffect("stun", 60)); // 1 second stun (60 fps)
    this.r = 15;
  }

  show() {
    push();
    translate(this.x + this.r, this.y + this.r);

    imageMode(CENTER);
    image(jellyShockImg, 0, 0, this.r*2, this.r*2);

     pop();
  }
}

class Anglerfish extends Player {
  constructor() {
    super();
    this.hp = 100;
    this.maxHp = 100;

    this.shootCooldown = 16;
    this.ammoCost = 6;
  }

  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;

    let p = new AnglerLight(
      this.x + this.w / 2,
      this.y + this.h / 2,
      0,
      400,
      4
    );
    projectiles.push(p);
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(shirtImg, 0, 0, this.w, this.h);

     pop();
    super.showAmmoBar();
  }
}

class AnglerLight extends Projectile {
  constructor(x, y, angle, maxDist, speed) {
    super(x, y, angle, maxDist, speed);
    this.effects.push(new StatusEffect("vuln", 240)); 
    this.r = 12;
  }

  show() {
    push();
    translate(this.x + this.r, this.y + this.r);

    imageMode(CENTER);
    image(jellyShockImg, 0, 0, this.r*2, this.r*2);

     pop();
  }
}

class Mackerel extends Player {
  constructor() {
    super();
    this.hp = 110;
    this.shootCooldown = 12;
  }

  shoot() {
    this.ammo -= 10;
    this.shootTimer = this.shootCooldown;
    
    // Spread of 3 shots
    for (let i = -1; i <= 1; i++) {
      let angle = i * 0.2; 
      let p = new Projectile(this.x, this.y, angle, 600, 8);
      projectiles.push(p);
    }
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(mackerelImg, 0, 0, this.w, this.h);

     pop();
    super.showAmmoBar();
  }
}

class Turtle extends Player {
  constructor() {
    super();
    this.hp = 110;
    this.shootCooldown = 700;
  }

  shoot() {
    this.ammo -= 10;
    this.shootTimer = this.shootCooldown;
    
    // Spread of 3 shots
    Player.shield += 10;
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(turtleImg, 0, 0, this.w, this.h);

     pop();
    super.showAmmoBar();
  }
}

class StatusEffect {
  constructor(type, duration) {
    this.type = type;
    this.duration = duration;
  }

  update(target) {
    this.duration--;

    if (this.type === "stun") {
      target.stunned = true;
    }

    return this.duration > 0;
  }
}

class FollowerFish {
  constructor(offsetAngle, radius, FishClass) {
    this.offsetAngle = offsetAngle;
    this.radius = radius;

    this.angle = random(TWO_PI);
    this.orbiting = true;

    this.x = 0;
    this.y = 0;

    // 🐟 real fish instance (visual + logic)
    this.fish = new FishClass();
    this.fish.frozen = true;

    this.shootTimer = this.fish.shootCooldown*2;
  }

  update(player) {
    if (this.orbiting) {
      this.angle += 0.02;

      this.x = player.x + cos(this.angle + this.offsetAngle) * this.radius;
      this.y = player.y + sin(this.angle + this.offsetAngle) * this.radius;
    } else {
      this.x = player.x;
      this.y = player.y;
    }

    this.shootTimer--;
    if (this.shootTimer <= 0) {
      this.shoot();
      this.shootTimer = this.fish.shootCooldown*2;
    }
  }

  shoot() {
    // 💥 SAFE VERSION (no crashes)
    let oldX = this.fish.x;
    let oldY = this.fish.y;

    this.fish.x = this.x;
    this.fish.y = this.y;

    // prevent undefined shoot crashes
    if (typeof this.fish.shoot === "function") {
      this.fish.shoot();
    }

    this.fish.x = oldX;
    this.fish.y = oldY;

    // ensure ownership is correct
    for (let i = projectiles.length - 1; i >= 0; i--) {
      if (projectiles[i] && projectiles[i].owner === undefined) {
        projectiles[i].owner = "player";
      }
    }
  }

  show() {
    this.fish.x = this.x;
    this.fish.y = this.y;
    this.fish.show();
  }
}
