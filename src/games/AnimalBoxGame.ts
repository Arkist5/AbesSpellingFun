import Phaser from 'phaser';
import { getWordsForPlay, WordItem } from '../core/store';
import { nextAnimal, resetAnimals } from '../core/animals';
import { playSound } from '../core/sfx';
import { speak, speakSlow } from '../core/tts';

const EVENT_REPLAY = 'asgs:replay';

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type ReplayEvent = CustomEvent<{ gameKey: string }>;

export class AnimalBoxGame extends Phaser.Scene {
  private words: WordItem[] = [];
  private index = 0;
  private typed = '';
  private mistakesForWord = 0;
  private totalMistakes = 0;
  private correctCount = 0;
  private hintGhost?: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private animalText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private replayHandler?: (event: Event) => void;
  private roundStart = 0;

  constructor() {
    super('AnimalBoxGame');
  }

  create() {
    this.words = shuffle(getWordsForPlay());
    this.index = 0;
    this.typed = '';
    this.mistakesForWord = 0;
    this.totalMistakes = 0;
    this.correctCount = 0;
    this.roundStart = Date.now();
    resetAnimals();

    this.cameras.main.setBackgroundColor('#fef6ff');

    this.add
      .text(512, 120, 'Type the word you hear!', {
        fontFamily: 'Nunito',
        fontSize: '36px',
        color: '#4b1e67'
      })
      .setOrigin(0.5);

    this.promptText = this.add
      .text(512, 240, '', {
        fontFamily: 'Fredoka One',
        fontSize: '72px',
        color: '#1b0630'
      })
      .setOrigin(0.5);

    this.hintGhost = this.add
      .text(512, 330, '', {
        fontFamily: 'Nunito',
        fontSize: '32px',
        color: '#a682c3'
      })
      .setOrigin(0.5);

    this.infoText = this.add
      .text(512, 420, '', {
        fontFamily: 'Nunito',
        fontSize: '28px',
        color: '#2f1b4a'
      })
      .setOrigin(0.5);

    this.animalText = this.add
      .text(512, 520, '', {
        fontFamily: 'Nunito',
        fontSize: '32px',
        color: '#0c6d5a'
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(20, 20, '', {
        fontFamily: 'Nunito',
        fontSize: '26px',
        color: '#230946'
      })
      .setOrigin(0, 0);

    if (this.words.length === 0) {
      this.promptText.setText('Add words on the Home page first!');
      return;
    }

    this.startWord();

    this.input.keyboard?.on('keydown', this.handleKey, this);

    this.replayHandler = (event: Event) => {
      const detail = (event as ReplayEvent).detail;
      if (detail?.gameKey === 'animal-box') {
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
      this.finishRound();
      return;
    }
    this.typed = '';
    this.mistakesForWord = 0;
    this.updatePrompt();
    this.hintGhost?.setText('');
    this.infoText.setText('');
    this.playPrompt();
    this.updateScore();
  }

  private playPrompt() {
    const current = this.words[this.index];
    if (!current) return;
    const text = current.text;
    void speak(text);
  }

  private handleKey(event: KeyboardEvent) {
    const current = this.words[this.index];
    if (!current) return;
    if (event.key === 'Backspace') {
      this.typed = this.typed.slice(0, -1);
      this.updatePrompt();
      return;
    }
    if (!/^[a-zA-Z]$/.test(event.key)) {
      return;
    }
    const expected = current.text[this.typed.length];
    const letter = event.key.toLowerCase();
    if (letter === expected) {
      this.typed += letter;
      this.updatePrompt();
      if (this.typed === current.text) {
        this.handleWordComplete();
      }
    } else {
      this.registerMistake();
    }
  }

  private updatePrompt() {
    const current = this.words[this.index];
    if (!current) return;
    const revealed = current.text
      .split('')
      .map((char, index) => (index < this.typed.length ? char.toUpperCase() : ' _ '))
      .join(' ');
    this.promptText.setText(revealed);
  }

  private handleWordComplete() {
    playSound('pop');
    this.correctCount += 1;
    this.infoText.setText('Great job! 🎉');
    if (this.correctCount % 3 === 0) {
      const animal = nextAnimal();
      this.animalText.setText(`An adorable ${animal} pops out of the box! 🐾`);
    } else {
      this.animalText.setText('');
    }
    this.index += 1;
    this.time.delayedCall(600, () => this.startWord());
  }

  private registerMistake() {
    playSound('buzzer');
    this.mistakesForWord += 1;
    this.totalMistakes += 1;
    this.infoText.setText('Try again!');
    const current = this.words[this.index];
    if (!current) return;
    if (this.mistakesForWord === 1) {
      this.time.delayedCall(300, () => this.playPrompt());
    } else if (this.mistakesForWord === 2) {
      this.time.delayedCall(300, () => speakSlow(current.text));
    } else if (this.mistakesForWord === 3) {
      this.hintGhost?.setText(`Starts with: ${current.text[0].toUpperCase()}`);
    }
    if (this.totalMistakes >= 2) {
      this.animalText.setText(`Word is: ${current.text}`);
    }
    this.updateScore();
  }

  private updateScore() {
    this.scoreText.setText(
      `Word ${Math.min(this.index + 1, this.words.length)} / ${this.words.length}\nMistakes: ${this.totalMistakes}`
    );
  }

  private finishRound() {
    const duration = Date.now() - this.roundStart;
    this.promptText.setText('All done! 🎊');
    this.infoText.setText(`Correct: ${this.correctCount}/${this.words.length} — Time ${Math.round(duration / 1000)}s`);
    this.animalText.setText('Play another game from the menu!');
  }
}
