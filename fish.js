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
    this.hp = 100;
    this.shield = 0;
    this.maxAmmo = 60;
    this.ammo = 60;
    this.ammoCost = 5;      
    this.rechargeRate = 0.25; 
    this.shootCooldown = 6; 
    this.shootTimer = 0;
    this.frozen = false;
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
  this.hp -= dmg;
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
      300,
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

    this.shootCooldown = 12;
    this.ammoCost = 6;
  }

  shoot() {
    this.ammo -= this.ammoCost;
    this.shootTimer = this.shootCooldown;

    let p = new JellyShock(
      this.x + this.w / 2,
      this.y + this.h / 2,
      0,
      250,
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
    this.r = 20;
  }

  show() {
    fill(200, 150, 255, 150);
    circle(this.x, this.y, this.r);
  }
}

class Anglerfish extends Player {
  constructor() {
    super();
    this.hp = 120;
    this.shieldRegenTimer = 0;
    this.shieldCooldown = 480; // About 8 seconds
    this.shieldValue = 20;     // Amount it grants
  }

  update() {
    if (!this.frozen) {
      super.update();
      this.provideShield(this); // Shield self if controlled by player
    } else {
      this.provideShield(player); // Shield the main player if a helper
    }
  }

  provideShield(target) {
    // If the target has no shield, start the recharge timer
    if (target.shield <= 0) {
      this.shieldRegenTimer++;
      if (this.shieldRegenTimer >= this.shieldCooldown) {
        target.shield = this.shieldValue;
        this.shieldRegenTimer = 0;
      }
    }
  }

  show() {
    // Draw the fish
    fill(40, 40, 70);
    rect(this.x, this.y, this.w, this.h, 8);
    
    // Draw the "Angler" light
    stroke(255, 255, 150);
    line(this.x + 10, this.y, this.x + 20, this.y - 15);
    noStroke();
    fill(255, 255, 200);
    circle(this.x + 20, this.y - 15, 6);

    if (!this.frozen) this.showAmmoBar();
  }
}

class Mackerel extends Player {
  constructor() {
    super();
    this.hp = 110;
    this.shootCooldown = 15;
  }

  shoot() {
    this.ammo -= 10;
    this.shootTimer = this.shootCooldown;
    
    // Spread of 3 shots
    for (let i = -1; i <= 1; i++) {
      let angle = i * 0.2; 
      let p = new Projectile(this.x, this.y, angle, 400, 8);
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

class Seahorse extends Player {
  constructor() {
    super();
    this.hp = 80;
    this.burstCount = 0;
    this.isBursting = true;
    this.burstCooldown = 0;
    this.shootCooldown = 120; 
  }

  // FollowerFish calls this
  shoot() {
    if (!this.isBursting && this.burstCooldown <= 0) {
      this.isBursting = true;
      this.burstCount = 20; 
      this.burstCooldown = this.shootCooldown;
    }
    
    if (this.burstCooldown > 0) this.burstCooldown--;

    // Rapid fire logic: This must run every frame
    if (this.isBursting) {
      // frameCount can be jumpy, using a counter is safer
      if (frameCount % 4 === 0) { 
        let p = new Projectile(this.x, this.y, random(-0.1, 0.1), 500, 12);
        p.owner = "player";
        projectiles.push(p);
        this.burstCount--;
      }

      if (this.burstCount <= 0) {
        this.isBursting = false;
      }
    }
  }

  update() {
    // If player-controlled, handle movement
    if (!this.frozen) super.update();

    // Always count down the cooldown
    
  }

  show() {
    push();
    translate(this.x, this.y);
    // Draw the Seahorse shape
    noStroke();
    fill(255, 200, 50); // Bright Yellow/Orange
    
    // Body (Curved)
    rectMode(CENTER);
    rect(0, 0, 15, 40, 10); 
    
    // Head
    ellipse(5, -15, 25, 15);
    
    // Snout
    rect(15, -15, 15, 5);
    
    // Eye
    fill(0);
    circle(8, -17, 3);
    
    // Fin (translucent)
    fill(255, 255, 255, 150);
    triangle(-5, 0, -15, -10, -15, 10);
    pop();

    if (!this.frozen) this.showAmmoBar();
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
