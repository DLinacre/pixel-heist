import * as Phaser from 'phaser';

/**
 * PIXEL HEIST — BOOT SCENE & IN-MEMORY TEXTURE SYNTHESIZER
 * Generates all 2D pixel-art textures programmatically on startup.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // We synthesize all textures procedurally in create() for zero external latency
  }

  create(): void {
    this.generateFloorTexture();
    this.generateWallTexture();
    this.generateThiefTexture();
    this.generateGuardTexture();
    this.generateChestTexture();
    this.generateVaultTexture();
    this.generateCctvTexture();
    this.generateLaserTexture();
    this.generateExtractTexture();
    this.generateSmokeTexture();
    this.generateDecoyTexture();

    // Transition immediately to the core stealth gameplay scene
    this.scene.start('MainScene', { seed: '2026-07-28-BANK-OF-PIXEL-HQ' });
  }

  private generateFloorTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x111420, 1);
    g.fillRect(0, 0, 32, 32);

    // Subtle metallic grid border
    g.lineStyle(1, 0x1b2032, 0.6);
    g.strokeRect(0, 0, 32, 32);

    // Minor decorative rivet dots
    g.fillStyle(0x222a42, 1);
    g.fillRect(4, 4, 2, 2);
    g.fillRect(26, 4, 2, 2);
    g.fillRect(4, 26, 2, 2);
    g.fillRect(26, 26, 2, 2);

    g.generateTexture('floor_tile', 32, 32);
    g.destroy();
  }

  private generateWallTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    // Solid security wall block
    g.fillStyle(0x20273c, 1);
    g.fillRect(0, 0, 32, 32);

    // Top highlight rim
    g.fillStyle(0x354060, 1);
    g.fillRect(0, 0, 32, 4);

    // Bottom shadow rim
    g.fillStyle(0x131724, 1);
    g.fillRect(0, 28, 32, 4);

    // Neon cyan security stripe
    g.fillStyle(0x00f0ff, 0.4);
    g.fillRect(4, 14, 24, 2);

    g.generateTexture('wall_tile', 32, 32);
    g.destroy();
  }

  private generateThiefTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = 24;
    // Hooded dark coat
    g.fillStyle(0x1a1e2e, 1);
    g.fillCircle(s / 2, s / 2, 10);

    // Inner cowl shadow
    g.fillStyle(0x0d0e14, 1);
    g.fillCircle(s / 2, s / 2 - 1, 6);

    // Neon cyan stealth goggles
    g.fillStyle(0x00f0ff, 1);
    g.fillRect(8, 9, 8, 3);

    // Utility belt
    g.fillStyle(0x303956, 1);
    g.fillRect(7, 16, 10, 2);

    g.generateTexture('thief', s, s);
    g.destroy();
  }

  private generateGuardTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = 24;
    // Armored tactical suit
    g.fillStyle(0x3d4663, 1);
    g.fillCircle(s / 2, s / 2, 11);

    // Shoulders
    g.fillStyle(0x56628c, 1);
    g.fillRect(4, 8, 16, 8);

    // Security helmet visor (red LED)
    g.fillStyle(0xff2a5f, 1);
    g.fillRect(7, 8, 10, 3);

    // Flashlight mount on right shoulder
    g.fillStyle(0xffcc00, 1);
    g.fillCircle(18, 10, 2);

    g.generateTexture('guard', s, s);
    g.destroy();
  }

  private generateChestTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = 24;
    // Gold & dark metallic chest
    g.fillStyle(0x1c2132, 1);
    g.fillRect(2, 4, 20, 16);

    // Gold trim
    g.fillStyle(0xffcc00, 1);
    g.fillRect(2, 4, 20, 3);
    g.fillRect(2, 17, 20, 3);
    g.fillRect(10, 8, 4, 8);

    // Cyan lock LED
    g.fillStyle(0x00f0ff, 1);
    g.fillRect(11, 10, 2, 3);

    g.generateTexture('chest', s, s);
    g.destroy();
  }

  private generateVaultTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = 32;
    // Massive steel vault door
    g.fillStyle(0x303a58, 1);
    g.fillRect(0, 0, s, s);

    // Reinforced bolt ring
    g.lineStyle(3, 0x4a5882, 1);
    g.strokeCircle(s / 2, s / 2, 10);

    // Lock terminal LED (Red when locked)
    g.fillStyle(0xff2a5f, 1);
    g.fillCircle(s / 2, s / 2, 4);

    g.generateTexture('vault_door', s, s);
    g.destroy();
  }

  private generateCctvTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x56628c, 1);
    g.fillCircle(8, 8, 6);
    // Camera lens indicator
    g.fillStyle(0xff2a5f, 1);
    g.fillCircle(11, 8, 2);
    g.generateTexture('cctv', 16, 16);
    g.destroy();
  }

  private generateLaserTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xff2a5f, 0.85);
    g.fillRect(0, 0, 32, 6);
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(0, 2, 32, 2);
    g.generateTexture('laser', 32, 6);
    g.destroy();
  }

  private generateExtractTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const s = 64;
    g.fillStyle(0x0e2024, 0.8);
    g.fillRect(0, 0, s, s);

    // Outer green glowing landing ring
    g.lineStyle(3, 0x00ff88, 0.9);
    g.strokeCircle(s / 2, s / 2, 26);

    // Inner chevron mark
    g.lineStyle(2, 0x00ff88, 1);
    g.strokeCircle(s / 2, s / 2, 14);

    g.fillStyle(0x00ff88, 1);
    g.fillCircle(s / 2, s / 2, 4);

    g.generateTexture('extract_pad', s, s);
    g.destroy();
  }

  private generateSmokeTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x4a5a75, 0.65);
    g.fillCircle(16, 16, 15);
    g.fillStyle(0x6e84ab, 0.45);
    g.fillCircle(16, 16, 10);
    g.generateTexture('smoke', 32, 32);
    g.destroy();
  }

  private generateDecoyTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x00f0ff, 1);
    g.fillCircle(8, 8, 5);
    g.lineStyle(2, 0x00f0ff, 0.6);
    g.strokeCircle(8, 8, 7);
    g.generateTexture('decoy', 16, 16);
    g.destroy();
  }
}
