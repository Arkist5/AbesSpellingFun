import Phaser from 'phaser';

export class BlockBreaker extends Phaser.Scene {
  constructor() {
    super('BlockBreaker');
  }

  create() {
    this.cameras.main.setBackgroundColor('#e0f7fa');
    this.add
      .text(512, 240, 'Block Breaker', {
        fontFamily: 'Fredoka One',
        fontSize: '56px',
        color: '#006064'
      })
      .setOrigin(0.5);

    this.add
      .text(512, 320, 'Coming soon — sneak peek bounce!', {
        fontFamily: 'Nunito',
        fontSize: '28px',
        color: '#004d40'
      })
      .setOrigin(0.5);

    const ball = this.add.circle(512, 420, 24, 0xff6f91);
    this.tweens.add({
      targets: ball,
      y: 520,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
