class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 40;
    this.h = 40;
    this.hp = 50;
    this.alive = true;
    this.stunned = false;
    this.stunTimer = 0;
    this.baseY = y;
    this.floatOffset = random(1000);
    this.floatSpeed = 0.05;
    this.shootTimer = int(random(60, 120));
  }

  update() {
    if (this.stunTimer > 0) {
      this.stunTimer--;
      this.stunned = true;
      return; 
    } else {
      this.stunned = false;
    }

    this.floatOffset += this.floatSpeed;
    this.y = this.baseY + sin(this.floatOffset) * 20;

    this.shootTimer--;
    if (this.shootTimer <= 0) {
      this.shoot();
      this.shootTimer = int(random(90, 150));
    }

    this.checkHits();
  }

  // --- THIS IS THE MISSING FUNCTION CAUSING THE CRASH ---
  collides(p) {
    return circleRectCollision(
      p.x,
      p.y,
      p.r,
      this.x,
      this.y,
      this.w,
      this.h
    );
  }

  checkHits() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      let p = projectiles[i];
      if (!p || !p.active || p.owner !== "player") continue;

      // Now this.collides(p) will work!
      if (this.collides(p)) {
        this.takeDamage(p.damage || 5);
        
        if (Array.isArray(p.effects)) {
          for (let effect of p.effects) {
            if (effect.type === "stun") this.stunTimer = effect.duration;
          }
        }

        p.active = false;
        projectiles.splice(i, 1);
      }
    }
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) this.alive = false;
  }

  shoot() {} // Overridden by subclasses
}

class Bottle extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.hp = 40;
  }

  shoot() {
    let angle = atan2(
      player.y - this.y,
      player.x - this.x
    );

    let p = new EnemyProjectile(
      this.x + this.w / 2,
      this.y + this.h / 2,
      angle,
      400,
      4
    );

    projectiles.push(p);
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(bottleImg, 0, 0, this.w, this.h);

     pop();
    
  }
}

class Shirt extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.hp = 70;
  }

  shoot() {
    let baseAngle = atan2(
      player.y - this.y,
      player.x - this.x
    );

    for (let i = -1; i <= 1; i++) {
      let angle = baseAngle + i * 0.2;

      let p = new EnemyProjectile(
        this.x + this.w / 2,
        this.y + this.h / 2,
        angle,
        400,
        3
      );

      projectiles.push(p);
    }
  }

  show() {
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(shirtImg, 0, 0, this.w, this.h);

     pop();
  }
}

class EnemyProjectile extends Projectile {
  constructor(x, y, angle, maxDist, speed) {
    // Ensure all 5 arguments are passed to the parent Projectile class
    super(x, y, angle, 800, speed); 
    this.owner = "enemy";
    this.damage = 10;
    this.r = 10;
  }

  update() {
    // Manually handle movement to ensure no weird Math.cos errors
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    if (dist(this.startX, this.startY, this.x, this.y) > this.maxDist) {
      this.active = false;
    }

    if (this.hitsPlayer()) {
      player.takeDamage(this.damage);
      this.active = false;
    }
  }

  hitsPlayer() {
    // Use the global function you already defined
    return circleRectCollision(
      this.x, this.y, this.r,
      player.x, player.y, player.w, player.h
    );
  }

  show() {
    push();
    translate(this.x + this.r, this.y + this.r);

    imageMode(CENTER);
    image(oilImg, 0, 0, this.r*2, this.r*2);

     pop();
  }
}

class Tire extends Enemy {
  constructor(x, y) {
    super(x, y);
    this.w = 60; // Bigger
    this.h = 60;
    this.hp = 250; // Tanky
  }

  shoot() {
    // Rapid fire 5 shots in a row
    for (let i = 0; i < 5; i++) {
      let angle = random(TWO_PI);
      let p = new EnemyProjectile(this.x, this.y, angle, 500, 2);
      projectiles.push(p);
    }
  }

  show() {
    // Draw a dark grey tire
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);

    imageMode(CENTER);
    image(tireImg, 0, 0, this.w, this.h);

     pop();
  }
}
