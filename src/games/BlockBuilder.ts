import Phaser from 'phaser';
import { getWordsForPlay, WordItem } from '../core/store';
import { playSound } from '../core/sfx';
import { speak } from '../core/tts';

const EVENT_REPLAY = 'asgs:replay';

type ReplayEvent = CustomEvent<{ gameKey: string }>;

export class BlockBuilder extends Phaser.Scene {
  private pending: WordItem[] = [];
  private finished: WordItem[] = [];
  private current?: WordItem;
  private typed = '';
  private missesForWord = 0;
  private towerGroup!: Phaser.GameObjects.Group;
  private messageText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private replayHandler?: (event: Event) => void;

  constructor() {
    super('BlockBuilder');
  }

  create() {
    this.pending = [...getWordsForPlay()];
    this.finished = [];
    this.typed = '';
    this.missesForWord = 0;
    this.cameras.main.setBackgroundColor('#eff9ff');

    this.add
      .text(512, 80, 'Stack letter blocks!', {
        fontFamily: 'Nunito',
        fontSize: '38px',
        color: '#0f3057'
      })
      .setOrigin(0.5);

    this.towerGroup = this.add.group();

    this.messageText = this.add
      .text(512, 140, '', {
        fontFamily: 'Nunito',
        fontSize: '28px',
        color: '#145374'
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(20, 20, '', {
        fontFamily: 'Nunito',
        fontSize: '26px',
        color: '#145374'
      })
      .setOrigin(0, 0);

    if (this.pending.length === 0) {
      this.messageText.setText('Add words on Home first.');
      return;
    }

    this.nextWord();
    this.updateScore();

    this.input.keyboard?.on('keydown', this.handleKey, this);

    this.replayHandler = (event: Event) => {
      const detail = (event as ReplayEvent).detail;
      if (detail?.gameKey === 'block-builder') {
        this.playPrompt();
      }
    };
    window.addEventListener(EVENT_REPLAY, this.replayHandler as EventListener);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(EVENT_REPLAY, this.replayHandler as EventListener);
      this.input.keyboard?.off('keydown', this.handleKey, this);
    });
  }

  private nextWord() {
    this.current = this.pending[0];
    if (!this.current) {
      this.messageText.setText('Tower complete! Tap "Knock it down" to celebrate.');
      this.createKnockButton();
      return;
    }
    this.typed = '';
    this.missesForWord = 0;
    this.messageText.setText(`Building: ${this.current.text.toUpperCase()}`);
    this.playPrompt();
  }

  private playPrompt() {
    if (!this.current) return;
    void speak(this.current.text);
  }

  private handleKey(event: KeyboardEvent) {
    if (!this.current) return;
    if (event.key === 'Backspace') {
      this.typed = this.typed.slice(0, -1);
      this.trimTowerBlocks();
      return;
    }
    if (!/^[a-zA-Z]$/.test(event.key)) return;
    const expected = this.current.text[this.typed.length];
    const letter = event.key.toLowerCase();
    if (letter === expected) {
      this.typed += letter;
      this.addBlock(letter.toUpperCase());
      if (this.typed === this.current.text) {
        this.onWordComplete();
      }
    } else {
      this.registerMiss();
    }
  }

  private addBlock(letter: string) {
    const blockWidth = 60;
    const blockHeight = 60;
    const x = 512;
    const yBase = 620;
    const level = this.towerGroup.getLength();
    const rect = this.add.rectangle(x, yBase - level * blockHeight, blockWidth, blockHeight, 0xffc75f);
    rect.setStrokeStyle(4, 0xff9642);
    const label = this.add.text(rect.x, rect.y, letter, {
      fontFamily: 'Fredoka One',
      fontSize: '36px',
      color: '#663f00'
    });
    label.setOrigin(0.5);
    this.towerGroup.add(rect);
    this.towerGroup.add(label);
    playSound('pop');
  }

  private trimTowerBlocks() {
    while (this.towerGroup.getLength() > this.finished.length * 2 + this.typed.length * 2) {
      const obj = this.towerGroup.getChildren().pop();
      obj?.destroy();
    }
  }

  private registerMiss() {
    this.missesForWord += 1;
    this.messageText.setText(`Oops! ${Math.max(0, 5 - this.missesForWord)} tries before a crash.`);
    playSound('buzzer');
    if (this.missesForWord >= 5) {
      this.triggerCrash();
    }
  }

  private triggerCrash() {
    this.messageText.setText('Crash! The tower tumbles down!');
    const children = this.towerGroup.getChildren();
    children.forEach((child, index) => {
      this.tweens.add({
        targets: child,
        duration: 600,
        y: (child as Phaser.GameObjects.GameObject & { y: number }).y + 200,
        x: (child as Phaser.GameObjects.GameObject & { x: number }).x + (index % 2 === 0 ? -120 : 120),
        angle: Phaser.Math.Between(-180, 180),
        ease: 'Cubic.easeIn',
        onComplete: () => child.destroy()
      });
    });
    const current = this.current;
    if (!current) return;
    this.pending = [current, ...this.pending.slice(1), ...this.finished];
    this.finished = [];
    this.time.delayedCall(700, () => {
      this.towerGroup.clear(true, true);
      this.nextWord();
      this.updateScore();
    });
  }

  private onWordComplete() {
    if (!this.current) return;
    this.finished.push(this.current);
    this.pending = this.pending.slice(1);
    this.messageText.setText(`${this.current.text.toUpperCase()} locked in!`);
    this.updateScore();
    this.time.delayedCall(400, () => {
      this.nextWord();
    });
  }

  private updateScore() {
    this.scoreText.setText(`Completed: ${this.finished.length}\nRemaining: ${this.pending.length}`);
  }

  private createKnockButton() {
    const button = this.add
      .text(512, 520, 'Knock it down!', {
        fontFamily: 'Fredoka One',
        fontSize: '42px',
        backgroundColor: '#ff6f91',
        padding: { x: 20, y: 10 },
        color: '#fff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on('pointerdown', () => {
      this.knockDownTower();
      button.disableInteractive();
      button.setAlpha(0.5);
    });
  }

  private knockDownTower() {
    playSound('confetti');
    this.towerGroup.getChildren().forEach((child) => {
      this.tweens.add({
        targets: child,
        duration: 800,
        y: (child as Phaser.GameObjects.GameObject & { y: number }).y + 400,
        angle: Phaser.Math.Between(90, 360),
        ease: 'Cubic.easeIn',
        onComplete: () => child.destroy()
      });
    });
    this.messageText.setText('Kaboom! The tower topples gloriously.');
  }
}
