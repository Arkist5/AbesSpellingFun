import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('preload');
  }

  preload() {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    const w = Math.min(480, width * 0.7);
    const h = 18;
    const x = (width - w) / 2;
    const y = height / 2;

    this.load.on('progress', (v: number) => {
      g.clear();
      g.fillStyle(0x663399, 1).fillRect(x, y, w * v, h);
      g.lineStyle(2, 0x222222).strokeRect(x, y, w, h);
    });
    this.load.on('complete', () => g.destroy());

  }

  create() {
    this.scene.start('menu');
  }
}
