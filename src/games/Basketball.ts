import Phaser from 'phaser';
import { getWordsForPlay } from '../core/store';
import { playSound } from '../core/sfx';
import { speak, speakSlow } from '../core/tts';

const EVENT_REPLAY = 'asgs:replay';

type ReplayEvent = CustomEvent<{ gameKey: string }>;

export class Basketball extends Phaser.Scene {
  private words: ReturnType<typeof getWordsForPlay> = [];
  private index = 0;
  private input = '';
  private streak = 0;
  private bestStreak = 0;
  private score = 0;
  private misses = 0;
  private promptText!: Phaser.GameObjects.Text;
  private inputText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  private shootButton!: Phaser.GameObjects.Text;
  private replayHandler?: (event: Event) => void;

  constructor() {
    super('Basketball');
  }

  create() {
    this.words = [...getWordsForPlay()];
    this.index = 0;
    this.input = '';
    this.streak = 0;
    this.bestStreak = 0;
    this.score = 0;
    this.misses = 0;

    this.cameras.main.setBackgroundColor('#fdf4e3');

    this.add
      .text(512, 80, 'Spell to sink the shot!', {
        fontFamily: 'Nunito',
        fontSize: '38px',
        color: '#ae3410'
      })
      .setOrigin(0.5);

    this.promptText = this.add
      .text(512, 160, '', {
        fontFamily: 'Nunito',
        fontSize: '32px',
        color: '#d17c11'
      })
      .setOrigin(0.5);

    this.inputText = this.add
      .text(512, 260, '', {
        fontFamily: 'Fredoka One',
        fontSize: '64px',
        color: '#332211'
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(512, 350, '', {
        fontFamily: 'Nunito',
        fontSize: '28px',
        color: '#ae3410'
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(20, 20, '', {
        fontFamily: 'Nunito',
        fontSize: '26px',
        color: '#ae3410'
      })
      .setOrigin(0, 0);

    this.shootButton = this.add
      .text(512, 460, 'Shoot!', {
        fontFamily: 'Fredoka One',
        fontSize: '48px',
        backgroundColor: '#ff8c42',
        padding: { x: 24, y: 14 },
        color: '#fff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.shootButton.on('pointerdown', () => this.submitWord());

    if (this.words.length === 0) {
      this.promptText.setText('Add words on Home first.');
      return;
    }

    this.startWord();

    this.input.keyboard?.on('keydown', this.handleKey, this);

    this.replayHandler = (event: Event) => {
      const detail = (event as ReplayEvent).detail;
      if (detail?.gameKey === 'basketball') {
        this.playPrompt();
      }
    };
    window.addEventListener(EVENT_REPLAY, this.replayHandler as EventListener);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(EVENT_REPLAY, this.replayHandler as EventListener);
      this.input.keyboard?.off('keydown', this.handleKey, this);
    });
  }

  private startWord() {
    const current = this.words[this.index];
    if (!current) {
      this.finishGame();
      return;
    }
    this.input = '';
    this.feedbackText.setText('');
    this.promptText.setText(`Word ${this.index + 1}/${this.words.length}`);
    this.playPrompt();
    this.updateInput();
    this.updateScore();
  }

  private playPrompt() {
    const current = this.words[this.index];
    if (!current) return;
    void speak(current.text);
  }

  private handleKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.submitWord();
      return;
    }
    if (event.key === 'Backspace') {
      this.input = this.input.slice(0, -1);
      this.updateInput();
      return;
    }
    if (!/^[a-zA-Z]$/.test(event.key)) return;
    this.input += event.key.toLowerCase();
    this.updateInput();
  }

  private updateInput() {
    if (this.input.length === 0) {
      this.inputText.setText('');
    } else {
      this.inputText.setText(this.input.toUpperCase());
    }
  }

  private submitWord() {
    const current = this.words[this.index];
    if (!current) return;
    if (this.input === current.text) {
      this.handleMake();
    } else {
      this.handleMiss();
    }
  }

  private handleMake() {
    const isThree = this.streak >= 2;
    const points = isThree ? 3 : 2;
    this.score += points;
    this.streak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.feedbackText.setText(isThree ? 'Splash! A 3-pointer!' : 'Nice shot! +2');
    playSound('swish');
    this.index += 1;
    this.time.delayedCall(500, () => this.startWord());
  }

  private handleMiss() {
    this.feedbackText.setText('Rimmed out! Try again.');
    playSound('buzzer');
    this.misses += 1;
    this.streak = 0;
    const current = this.words[this.index];
    if (!current) return;
    if (this.misses === 1) {
      this.time.delayedCall(250, () => this.playPrompt());
    } else if (this.misses === 2) {
      this.time.delayedCall(250, () => speakSlow(current.text));
    }
    this.updateScore();
  }

  private updateScore() {
    this.scoreText.setText(
      `Score: ${this.score}\nStreak: ${this.streak}\nBest: ${this.bestStreak}`
    );
  }

  private finishGame() {
    this.promptText.setText('Game over!');
    this.feedbackText.setText(
      `Final score: ${this.score} • Best streak: ${this.bestStreak}`
    );
    this.inputText.setText('');
    this.shootButton.disableInteractive();
    this.shootButton.setAlpha(0.6);
  }
}
