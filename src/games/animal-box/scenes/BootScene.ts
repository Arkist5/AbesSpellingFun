import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  create() {
    // configure scale or globals in the future
    this.scene.start('preload');
  }
}
