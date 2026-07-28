import * as Phaser from 'phaser';
import { generateFacilityLevel, GeneratedLevel } from '@/lib/procedural/levelGenerator';
import {
  EventBus,
  EVENT_LOOT_UPDATED,
  EVENT_ALARM_CHANGED,
  EVENT_OPEN_LOCKPICK,
  EVENT_MISSION_END,
  EVENT_TIMER_TICK,
  EVENT_GADGET_USED,
  COMMAND_USE_GADGET,
  COMMAND_SOLVE_LOCKPICK,
  COMMAND_RESTART_MISSION,
} from '../GameEvents';
import { soundManager } from '@/lib/sound/soundManager';
import { AlarmLevel, GadgetType, Point2D } from '@/lib/types';

interface GuardEntity {
  id: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  state: 'PATROL' | 'SUSPICIOUS' | 'ALERT' | 'CHASE';
  waypoints: Point2D[];
  currentWaypointIdx: number;
  visionConeGraphics: Phaser.GameObjects.Graphics;
  alertIcon: Phaser.GameObjects.Text;
  suspiciousTimer: number;
  lastKnownPlayerPos?: Point2D;
}

interface CctvEntity {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  angle: number;
  startAngle: number;
  sweepRange: number;
  speed: number;
  direction: number; // 1 or -1
  coneGraphics: Phaser.GameObjects.Graphics;
  disabledUntil: number; // timestamp in ms
}

interface LaserEntity {
  id: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  active: boolean;
  disabledUntil: number;
}

/**
 * PIXEL HEIST — MAIN STEALTH INFILTRATION SCENE
 */
export class MainScene extends Phaser.Scene {
  private seedString: string = '2026-07-28-BANK-OF-PIXEL-HQ';
  private level!: GeneratedLevel;
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private chestsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private lasersGroup!: Phaser.Physics.Arcade.StaticGroup;
  private vaultSprite!: Phaser.Physics.Arcade.Sprite;
  private extractPad!: Phaser.Physics.Arcade.Sprite;

  private guards: GuardEntity[] = [];
  private cctvs: CctvEntity[] = [];
  private lasers: LaserEntity[] = [];

  // Game state
  private currentLoot: number = 0;
  private timeRemaining: number = 180; // 3 minutes
  private alarmLevel: AlarmLevel = 'CLEAR';
  private totalAlerts: number = 0;
  private isGameOver: boolean = false;
  private isLockpicking: boolean = false;
  private isVaultUnlocked: boolean = false;

  // Modifiers & Gadget effects
  private sprintSpeedMultiplier: number = 1.0;
  private sprintExpiresAt: number = 0;
  private activeDecoy: { x: number; y: number; expiresAt: number; sprite: Phaser.GameObjects.Sprite } | null = null;
  private activeSmoke: { x: number; y: number; radius: number; expiresAt: number; sprite: Phaser.GameObjects.Sprite } | null = null;

  // Timers
  private gameTimerEvent!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: { seed?: string }): void {
    if (data && data.seed) {
      this.seedString = data.seed;
    }
  }

  create(): void {
    this.isGameOver = false;
    this.isLockpicking = false;
    this.isVaultUnlocked = false;
    this.currentLoot = 0;
    this.timeRemaining = 180;
    this.alarmLevel = 'CLEAR';
    this.totalAlerts = 0;
    this.guards = [];
    this.cctvs = [];
    this.lasers = [];

    // 1. Generate Procedural Facility
    this.level = generateFacilityLevel(this.seedString);

    // 2. Build Tilemap & Walls
    this.buildFacilityWorld();

    // 3. Setup Extraction Zone
    this.extractPad = this.physics.add.sprite(
      this.level.extractZone.x,
      this.level.extractZone.y,
      'extract_pad'
    );
    this.extractPad.setDepth(2);

    // 4. Setup Loot Chests
    this.setupChests();

    // 5. Setup Master Vault
    this.setupVault();

    // 6. Setup Lasers
    this.setupLasers();

    // 7. Setup Player Thief
    this.setupPlayer();

    // 8. Setup Guard AI & CCTV Cameras
    this.setupGuards();
    this.setupCameras();

    // 9. Setup Collisions & Overlaps
    this.physics.add.collider(this.player, this.wallsGroup);

    this.physics.add.overlap(
      this.player,
      this.chestsGroup,
      this.handleChestPickup as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.vaultSprite,
      this.handleVaultTouch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.extractPad,
      this.handleExtractTouch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.lasersGroup,
      this.handleLaserTouch as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // 10. Camera Setup
    this.cameras.main.setBounds(
      0,
      0,
      this.level.widthTiles * this.level.tileSize,
      this.level.heightTiles * this.level.tileSize
    );
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.2);

    // 11. Setup Timer Event
    this.gameTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });

    // 12. Setup Keyboard Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };

      // Gadget Keyboard shortcuts (1, 2, 3, 4)
      this.input.keyboard.on('keydown-ONE', () => this.triggerGadget('EMP'));
      this.input.keyboard.on('keydown-TWO', () => this.triggerGadget('DECOY'));
      this.input.keyboard.on('keydown-THREE', () => this.triggerGadget('SMOKE'));
      this.input.keyboard.on('keydown-FOUR', () => this.triggerGadget('SPRINT'));
    }

    // 13. Listen to React Bridge Commands
    this.bindReactEventBridge();

    // Broadcast initial stats to UI HUD
    EventBus.emit(EVENT_LOOT_UPDATED, {
      currentLoot: this.currentLoot,
      targetLoot: 15000,
    });
    EventBus.emit(EVENT_ALARM_CHANGED, {
      level: this.alarmLevel,
      alertsCount: this.totalAlerts,
    });
  }

  private buildFacilityWorld(): void {
    const { grid, tileSize, widthTiles, heightTiles } = this.level;
    this.wallsGroup = this.physics.add.staticGroup();

    for (let y = 0; y < heightTiles; y++) {
      for (let x = 0; x < widthTiles; x++) {
        const posX = x * tileSize + tileSize / 2;
        const posY = y * tileSize + tileSize / 2;

        if (grid[y][x] === 1) {
          // Wall tile
          const wall = this.wallsGroup.create(posX, posY, 'wall_tile');
          wall.setDepth(5);
        } else {
          // Floor tile
          const floor = this.add.image(posX, posY, 'floor_tile');
          floor.setDepth(1);
        }
      }
    }
  }

  private setupChests(): void {
    this.chestsGroup = this.physics.add.staticGroup();
    for (const chestData of this.level.lootChests) {
      const c = this.chestsGroup.create(
        chestData.x,
        chestData.y,
        'chest'
      ) as Phaser.Physics.Arcade.Sprite;
      c.setData('id', chestData.id);
      c.setData('value', chestData.value);
      c.setDepth(3);
    }
  }

  private setupVault(): void {
    this.vaultSprite = this.physics.add.sprite(
      this.level.vault.x,
      this.level.vault.y,
      'vault_door'
    );
    this.vaultSprite.setImmovable(true);
    this.vaultSprite.setDepth(4);
    this.physics.add.collider(this.player, this.vaultSprite);
  }

  private setupLasers(): void {
    this.lasersGroup = this.physics.add.staticGroup();
    for (const lData of this.level.lasers) {
      const sprite = this.lasersGroup.create(
        lData.x,
        lData.y,
        'laser'
      ) as Phaser.Physics.Arcade.Sprite;
      sprite.setDepth(3);

      this.lasers.push({
        id: lData.id,
        sprite,
        active: lData.active,
        disabledUntil: 0,
      });
    }
  }

  private setupPlayer(): void {
    this.player = this.physics.add.sprite(
      this.level.spawnPoint.x,
      this.level.spawnPoint.y,
      'thief'
    );
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
  }

  private setupGuards(): void {
    for (const gData of this.level.guards) {
      const startPos = gData.waypoints[0] || { x: 400, y: 400 };
      const sprite = this.physics.add.sprite(
        startPos.x,
        startPos.y,
        'guard'
      );
      sprite.setDepth(9);
      sprite.setCollideWorldBounds(true);
      this.physics.add.collider(sprite, this.wallsGroup);

      const visionConeGraphics = this.add.graphics();
      visionConeGraphics.setDepth(2);

      const alertIcon = this.add.text(
        startPos.x,
        startPos.y - 24,
        '',
        {
          fontSize: '14px',
          color: '#ffcc00',
          fontStyle: 'bold',
        }
      );
      alertIcon.setOrigin(0.5);
      alertIcon.setDepth(11);

      this.guards.push({
        id: gData.guardId,
        sprite,
        state: gData.initialState,
        waypoints: gData.waypoints,
        currentWaypointIdx: 0,
        visionConeGraphics,
        alertIcon,
        suspiciousTimer: 0,
      });
    }
  }

  private setupCameras(): void {
    for (const cData of this.level.cameras) {
      const sprite = this.add.sprite(cData.x, cData.y, 'cctv');
      sprite.setDepth(8);

      const coneGraphics = this.add.graphics();
      coneGraphics.setDepth(2);

      this.cctvs.push({
        id: cData.id,
        sprite,
        angle: cData.startAngle,
        startAngle: cData.startAngle,
        sweepRange: cData.sweepRange,
        speed: cData.speed,
        direction: 1,
        coneGraphics,
        disabledUntil: 0,
      });
    }
  }

  private bindReactEventBridge(): void {
    // Unbind any previous listeners to prevent duplicates
    EventBus.off(COMMAND_USE_GADGET);
    EventBus.off(COMMAND_SOLVE_LOCKPICK);
    EventBus.off(COMMAND_RESTART_MISSION);

    EventBus.on(COMMAND_USE_GADGET, (gadgetType: GadgetType) => {
      this.triggerGadget(gadgetType);
    });

    EventBus.on(
      COMMAND_SOLVE_LOCKPICK,
      (payload: { success: boolean; vaultId: string }) => {
        this.isLockpicking = false;
        if (payload.success) {
          this.unlockVault();
        }
      }
    );

    EventBus.on(COMMAND_RESTART_MISSION, (seed?: string) => {
      if (seed) this.seedString = seed;
      this.scene.restart({ seed: this.seedString });
    });
  }

  private onTimerTick(): void {
    if (this.isGameOver || this.isLockpicking) return;

    this.timeRemaining = Math.max(0, this.timeRemaining - 1);
    EventBus.emit(EVENT_TIMER_TICK, { timeRemaining: this.timeRemaining });

    if (this.timeRemaining === 0) {
      this.endMission(false, 'TIME_EXPIRED');
    }
  }

  update(time: number, delta: number): void {
    if (this.isGameOver || this.isLockpicking) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.handlePlayerMovement(delta);
    this.updateGuards(delta, time);
    this.updateCameras(delta, time);
    this.updateGadgetEffects(time);
  }

  private handlePlayerMovement(delta: number): void {
    let vx = 0;
    let vy = 0;
    const baseSpeed = 120;
    const speed =
      this.sprintExpiresAt > this.time.now
        ? baseSpeed * 1.5
        : baseSpeed;

    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      vx = -speed;
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      vx = speed;
    }

    if (this.cursors.up.isDown || this.wasd.W.isDown) {
      vy = -speed;
    } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
      vy = speed;
    }

    // Normalize diagonal velocity
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx, vy);

    // Rotate player slightly toward movement direction
    if (vx !== 0 || vy !== 0) {
      const angle = Math.atan2(vy, vx);
      this.player.setRotation(angle);
    }
  }

  private updateGuards(delta: number, time: number): void {
    const deltaSeconds = delta / 1000;

    for (const g of this.guards) {
      g.visionConeGraphics.clear();
      g.alertIcon.setPosition(g.sprite.x, g.sprite.y - 28);

      // Check if guard is distracted by an active decoy
      if (
        this.activeDecoy &&
        time < this.activeDecoy.expiresAt &&
        g.state === 'PATROL'
      ) {
        const distToDecoy = Phaser.Math.Distance.Between(
          g.sprite.x,
          g.sprite.y,
          this.activeDecoy.x,
          this.activeDecoy.y
        );
        if (distToDecoy < 220) {
          g.state = 'SUSPICIOUS';
          g.lastKnownPlayerPos = { x: this.activeDecoy.x, y: this.activeDecoy.y };
          g.alertIcon.setText('?');
          g.alertIcon.setColor('#00f0ff');
          soundManager.playSuspicious();
        }
      }

      // 1. Raycasting Vision Cone against Player
      const isPlayerVisible = this.checkGuardVision(g);

      if (isPlayerVisible) {
        if (g.state === 'PATROL') {
          g.state = 'SUSPICIOUS';
          g.suspiciousTimer = time + 800; // 0.8 seconds before triggering full ALERT
          g.alertIcon.setText('?');
          g.alertIcon.setColor('#ffcc00');
          soundManager.playSuspicious();
        } else if (g.state === 'SUSPICIOUS' && time > g.suspiciousTimer) {
          g.state = 'ALERT';
          g.alertIcon.setText('!');
          g.alertIcon.setColor('#ff2a5f');
          this.triggerFacilityAlert();
          soundManager.playAlert();
        } else if (g.state === 'ALERT') {
          g.state = 'CHASE';
          g.lastKnownPlayerPos = { x: this.player.x, y: this.player.y };
        }
      } else {
        if (g.state === 'CHASE' && Phaser.Math.Distance.Between(g.sprite.x, g.sprite.y, this.player.x, this.player.y) > 280) {
          // Return to patrol if player breaks line of sight long enough
          g.state = 'PATROL';
          g.alertIcon.setText('');
        }
      }

      // 2. Execute State Machine Movement
      if (g.state === 'PATROL') {
        this.moveGuardAlongWaypoints(g, 65);
      } else if (g.state === 'SUSPICIOUS' && g.lastKnownPlayerPos) {
        this.moveGuardToTarget(g, g.lastKnownPlayerPos, 80);
      } else if (g.state === 'ALERT' || g.state === 'CHASE') {
        this.moveGuardToTarget(g, { x: this.player.x, y: this.player.y }, 110);
      }

      // 3. Render Vision Cone Graphics
      this.drawGuardVisionCone(g);
    }
  }

  private checkGuardVision(g: GuardEntity): boolean {
    // Check if smoke bomb obscures line of sight
    if (this.activeSmoke && this.time.now < this.activeSmoke.expiresAt) {
      const distToSmoke = Phaser.Math.Distance.Between(
        g.sprite.x,
        g.sprite.y,
        this.activeSmoke.x,
        this.activeSmoke.y
      );
      if (distToSmoke < this.activeSmoke.radius + 40) {
        return false; // Smoke hides player
      }
    }

    const distToPlayer = Phaser.Math.Distance.Between(
      g.sprite.x,
      g.sprite.y,
      this.player.x,
      this.player.y
    );

    if (distToPlayer > 170) return false;

    // Angle check (45 degree cone)
    const angleToPlayer = Phaser.Math.Angle.Between(
      g.sprite.x,
      g.sprite.y,
      this.player.x,
      this.player.y
    );

    const angleDiff = Math.abs(
      Phaser.Math.Angle.Wrap(angleToPlayer - g.sprite.rotation)
    );

    if (angleDiff > Phaser.Math.DegToRad(40)) return false;

    // Raycast Line of Sight against walls
    const line = new Phaser.Geom.Line(
      g.sprite.x,
      g.sprite.y,
      this.player.x,
      this.player.y
    );

    let isBlocked = false;
    const walls = this.wallsGroup.getChildren();
    for (const w of walls) {
      const wallSprite = w as Phaser.Physics.Arcade.Sprite;
      const bounds = wallSprite.getBounds();
      if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
        isBlocked = true;
        break;
      }
    }

    return !isBlocked;
  }

  private moveGuardAlongWaypoints(g: GuardEntity, speed: number): void {
    if (!g.waypoints || g.waypoints.length === 0) return;

    const target = g.waypoints[g.currentWaypointIdx];
    const dist = Phaser.Math.Distance.Between(
      g.sprite.x,
      g.sprite.y,
      target.x,
      target.y
    );

    if (dist < 10) {
      g.currentWaypointIdx = (g.currentWaypointIdx + 1) % g.waypoints.length;
    } else {
      this.moveGuardToTarget(g, target, speed);
    }
  }

  private moveGuardToTarget(g: GuardEntity, target: Point2D, speed: number): void {
    const angle = Phaser.Math.Angle.Between(
      g.sprite.x,
      g.sprite.y,
      target.x,
      target.y
    );

    g.sprite.setRotation(angle);
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    g.sprite.setVelocity(vx, vy);
  }

  private drawGuardVisionCone(g: GuardEntity): void {
    const coneColor =
      g.state === 'ALERT' || g.state === 'CHASE'
        ? 0xff2a5f
        : g.state === 'SUSPICIOUS'
        ? 0xffcc00
        : 0x00ff88;

    g.visionConeGraphics.fillStyle(coneColor, 0.15);
    g.visionConeGraphics.lineStyle(1, coneColor, 0.4);

    const radius = 160;
    const halfAngle = Phaser.Math.DegToRad(35);
    const centerAngle = g.sprite.rotation;

    g.visionConeGraphics.beginPath();
    g.visionConeGraphics.moveTo(g.sprite.x, g.sprite.y);
    g.visionConeGraphics.arc(
      g.sprite.x,
      g.sprite.y,
      radius,
      centerAngle - halfAngle,
      centerAngle + halfAngle,
      false
    );
    g.visionConeGraphics.closePath();
    g.visionConeGraphics.fillPath();
    g.visionConeGraphics.strokePath();
  }

  private updateCameras(delta: number, time: number): void {
    for (const c of this.cctvs) {
      c.coneGraphics.clear();

      if (time < c.disabledUntil) {
        // Disabled by EMP
        continue;
      }

      // Rotate camera
      c.angle += c.speed * c.direction * (delta / 16);
      if (c.angle > c.startAngle + c.sweepRange) {
        c.direction = -1;
      } else if (c.angle < c.startAngle - c.sweepRange) {
        c.direction = 1;
      }

      // Render CCTV sweep cone
      c.coneGraphics.fillStyle(0xffcc00, 0.12);
      c.coneGraphics.lineStyle(1, 0xffcc00, 0.3);

      const rad = Phaser.Math.DegToRad(c.angle);
      const halfCone = Phaser.Math.DegToRad(25);
      const radius = 150;

      c.coneGraphics.beginPath();
      c.coneGraphics.moveTo(c.sprite.x, c.sprite.y);
      c.coneGraphics.arc(
        c.sprite.x,
        c.sprite.y,
        radius,
        rad - halfCone,
        rad + halfCone,
        false
      );
      c.coneGraphics.closePath();
      c.coneGraphics.fillPath();

      // Check if player is inside CCTV vision cone
      const distToPlayer = Phaser.Math.Distance.Between(
        c.sprite.x,
        c.sprite.y,
        this.player.x,
        this.player.y
      );

      if (distToPlayer <= radius) {
        const angleToPlayer = Phaser.Math.Angle.Between(
          c.sprite.x,
          c.sprite.y,
          this.player.x,
          this.player.y
        );
        const angleDiff = Math.abs(
          Phaser.Math.Angle.Wrap(angleToPlayer - rad)
        );

        if (angleDiff <= halfCone) {
          // Camera spotted thief!
          this.triggerFacilityAlert();
          soundManager.playAlert();
        }
      }
    }
  }

  private updateGadgetEffects(time: number): void {
    // Check if decoy expired
    if (this.activeDecoy && time >= this.activeDecoy.expiresAt) {
      this.activeDecoy.sprite.destroy();
      this.activeDecoy = null;
    }

    // Check if smoke expired
    if (this.activeSmoke && time >= this.activeSmoke.expiresAt) {
      this.activeSmoke.sprite.destroy();
      this.activeSmoke = null;
    }
  }

  private handleChestPickup(
    player: Phaser.Physics.Arcade.Sprite,
    chest: Phaser.Physics.Arcade.Sprite
  ): void {
    const value = (chest.getData('value') as number) || 1500;
    this.currentLoot += value;

    // Floating text effect
    const text = this.add.text(chest.x, chest.y - 10, `+$${value}`, {
      fontSize: '14px',
      color: '#00ff88',
      fontStyle: 'bold',
    });
    text.setOrigin(0.5);
    text.setDepth(15);
    this.tweens.add({
      targets: text,
      y: chest.y - 35,
      alpha: 0,
      duration: 900,
      onComplete: () => text.destroy(),
    });

    chest.destroy();
    soundManager.playCoinPickup();

    EventBus.emit(EVENT_LOOT_UPDATED, {
      currentLoot: this.currentLoot,
      targetLoot: 15000,
    });
  }

  private handleVaultTouch(
    player: Phaser.Physics.Arcade.Sprite,
    vaultSprite: Phaser.Physics.Arcade.Sprite
  ): void {
    if (this.isVaultUnlocked || this.isLockpicking) return;

    this.isLockpicking = true;
    soundManager.playLockpickClick();

    // Trigger React lockpick modal overlay
    EventBus.emit(EVENT_OPEN_LOCKPICK, {
      vaultId: 'master_vault',
      difficulty: 2,
    });
  }

  public unlockVault(): void {
    this.isVaultUnlocked = true;
    soundManager.playLockpickSuccess();

    // Grant vault bonus loot ($10,000)
    const vaultValue = 10000;
    this.currentLoot += vaultValue;

    const text = this.add.text(
      this.vaultSprite.x,
      this.vaultSprite.y - 15,
      `VAULT HACKED: +$${vaultValue}!`,
      {
        fontSize: '16px',
        color: '#00f0ff',
        fontStyle: 'bold',
      }
    );
    text.setOrigin(0.5);
    text.setDepth(15);
    this.tweens.add({
      targets: text,
      y: this.vaultSprite.y - 45,
      alpha: 0,
      duration: 1500,
      onComplete: () => text.destroy(),
    });

    // Open door texture visually
    this.vaultSprite.setTint(0x00ff88);

    EventBus.emit(EVENT_LOOT_UPDATED, {
      currentLoot: this.currentLoot,
      targetLoot: 15000,
    });
  }

  private handleLaserTouch(
    player: Phaser.Physics.Arcade.Sprite,
    laserSprite: Phaser.Physics.Arcade.Sprite
  ): void {
    // Find matching laser entity
    const l = this.lasers.find((item) => item.sprite === laserSprite);
    if (!l || !l.active || this.time.now < l.disabledUntil) return;

    this.triggerFacilityAlert();
    soundManager.playAlert();

    // Visual pulse
    laserSprite.setTint(0xffffff);
    this.time.delayedCall(200, () => laserSprite.clearTint());
  }

  private handleExtractTouch(
    player: Phaser.Physics.Arcade.Sprite,
    extract: Phaser.Physics.Arcade.Sprite
  ): void {
    if (this.isGameOver) return;

    // Check if player has minimum target loot ($10,000)
    if (this.currentLoot >= 10000) {
      this.endMission(true, 'EXTRACTION_COMPLETE');
    } else {
      // Prompt player that more loot is required
      const warn = this.add.text(
        extract.x,
        extract.y - 30,
        'NEED MINIMUM $10,000 LOOT TO EXTRACT!',
        {
          fontSize: '12px',
          color: '#ff2a5f',
          fontStyle: 'bold',
        }
      );
      warn.setOrigin(0.5);
      warn.setDepth(15);
      this.time.delayedCall(1200, () => warn.destroy());
    }
  }

  private triggerFacilityAlert(): void {
    if (this.alarmLevel === 'ALERT') return;

    this.totalAlerts++;
    this.alarmLevel = 'ALERT';
    soundManager.startSiren();

    EventBus.emit(EVENT_ALARM_CHANGED, {
      level: this.alarmLevel,
      alertsCount: this.totalAlerts,
    });

    // Screen flash
    this.cameras.main.flash(300, 255, 42, 95);

    // After 8 seconds of evasion, alarm drops back to SUSPICIOUS
    this.time.delayedCall(8000, () => {
      if (!this.isGameOver) {
        this.alarmLevel = 'SUSPICIOUS';
        soundManager.stopSiren();
        EventBus.emit(EVENT_ALARM_CHANGED, {
          level: this.alarmLevel,
          alertsCount: this.totalAlerts,
        });
      }
    });
  }

  public triggerGadget(gadgetType: GadgetType): void {
    if (this.isGameOver || this.isLockpicking) return;

    const now = this.time.now;

    if (gadgetType === 'EMP') {
      soundManager.playEmpBlast();
      // Disable all CCTV cameras and lasers for 8 seconds
      const empDuration = 8000;
      for (const c of this.cctvs) {
        c.disabledUntil = now + empDuration;
      }
      for (const l of this.lasers) {
        l.disabledUntil = now + empDuration;
        l.sprite.setAlpha(0.2);
        this.time.delayedCall(empDuration, () => l.sprite.setAlpha(1));
      }

      // Visual EMP pulse ring around player
      const circle = this.add.circle(
        this.player.x,
        this.player.y,
        20,
        0x00f0ff,
        0.5
      );
      this.tweens.add({
        targets: circle,
        radius: 200,
        alpha: 0,
        duration: 600,
        onComplete: () => circle.destroy(),
      });
    } else if (gadgetType === 'DECOY') {
      soundManager.playDecoyPulse();
      // Spawn sound beacon 120px in front of player
      const angle = this.player.rotation;
      const targetX = this.player.x + Math.cos(angle) * 120;
      const targetY = this.player.y + Math.sin(angle) * 120;

      const sprite = this.add.sprite(targetX, targetY, 'decoy');
      sprite.setDepth(6);

      this.activeDecoy = {
        x: targetX,
        y: targetY,
        expiresAt: now + 5000,
        sprite,
      };

      // Pulse ring animation
      const ring = this.add.circle(targetX, targetY, 15, 0x00f0ff, 0.4);
      this.tweens.add({
        targets: ring,
        radius: 180,
        alpha: 0,
        duration: 1000,
        repeat: 4,
        onComplete: () => ring.destroy(),
      });
    } else if (gadgetType === 'SMOKE') {
      soundManager.playSuspicious();
      const sprite = this.add.sprite(this.player.x, this.player.y, 'smoke');
      sprite.setScale(3.5);
      sprite.setDepth(7);

      this.activeSmoke = {
        x: this.player.x,
        y: this.player.y,
        radius: 110,
        expiresAt: now + 6000,
        sprite,
      };
    } else if (gadgetType === 'SPRINT') {
      soundManager.playCoinPickup();
      this.sprintExpiresAt = now + 5000;
      this.player.setTint(0x00f0ff);
      this.time.delayedCall(5000, () => this.player.clearTint());
    }

    EventBus.emit(EVENT_GADGET_USED, { gadgetType });
  }

  private endMission(success: boolean, reason: string): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    soundManager.stopSiren();

    EventBus.emit(EVENT_MISSION_END, {
      runId: `run_${Date.now()}`,
      contractDate: '2026-07-28',
      seedString: this.seedString,
      lootCollected: this.currentLoot,
      timeRemainingSeconds: this.timeRemaining,
      alertsTriggered: this.totalAlerts,
      status: success ? 'SUCCESS' : 'FAILED',
    });
  }
}
