import Phaser from 'phaser';
import { getWordsForPlay } from '../core/store';
import { speak } from '../core/tts';
import { playSound } from '../core/sfx';

const EVENT_REPLAY = 'asgs:replay';

export type Dir = 'N' | 'S' | 'E' | 'W';

type Axis = 'NS' | 'EW';

type ReplayEvent = CustomEvent<{ gameKey: string }>;

type LetterMilestone = 3 | 5 | 8;

function isMilestone(value: number): value is LetterMilestone {
  return value === 3 || value === 5 || value === 8;
}

class Car extends Phaser.GameObjects.Rectangle {
  dir: Dir;
  speed: number;
  state: 'APPROACH' | 'QUEUED' | 'CROSSING' | 'EXITED' = 'APPROACH';

  constructor(scene: Phaser.Scene, x: number, y: number, dir: Dir, speed: number) {
    super(scene, x, y, 26, 44, 0xffffff, 1);
    this.dir = dir;
    this.speed = speed;
    const colors: Record<Dir, number> = {
      N: 0x8ec5ff,
      S: 0xffa6c7,
      E: 0xaef4c4,
      W: 0xffd28c
    };
    this.setFillStyle(colors[dir]);
    scene.add.existing(this);
  }
}

class TrafficLight {
  private scene: Phaser.Scene;
  private forcedUntil = 0;
  phase: 'NS_GREEN' | 'EW_GREEN' = 'NS_GREEN';

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  update(time: number) {
    if (this.forcedUntil > time) {
      return;
    }
    const loop = Math.floor((time / 1000) % 8);
    this.phase = loop < 4 ? 'NS_GREEN' : 'EW_GREEN';
  }

  isGreenFor(dir: Dir): boolean {
    if (dir === 'N' || dir === 'S') {
      return this.phase === 'NS_GREEN';
    }
    return this.phase === 'EW_GREEN';
  }

  force(axis: Axis, ms: number) {
    this.phase = axis === 'NS' ? 'NS_GREEN' : 'EW_GREEN';
    this.forcedUntil = this.scene.time.now + ms;
    this.scene.time.delayedCall(ms, () => {
      this.forcedUntil = 0;
    });
  }
}

class TrafficManager {
  private scene: Phaser.Scene;
  private center = new Phaser.Math.Vector2();
  private spawnInterval: Record<Dir, number> = { N: 1.6, S: 1.8, E: 1.2, W: 1.6 };
  private lastSpawn: Record<Dir, number> = { N: 0, S: 0, E: 0, W: 0 };
  private lanes: Record<Dir, Car[]> = { N: [], S: [], E: [], W: [] };
  private light: TrafficLight;
  private highlightTimers: Record<Axis, number> = { NS: 0, EW: 0 };

  carsExited = 0;

  constructor(scene: Phaser.Scene, private onCarExit: () => void) {
    this.scene = scene;
    this.light = new TrafficLight(scene);
  }

  init(centerX: number, centerY: number) {
    this.center.set(centerX, centerY);
  }

  update(time: number, dt: number) {
    this.light.update(time);
    this.spawnIfNeeded(time);
    this.moveCars(dt);
    this.fadeHighlights(dt);
  }

  private fadeHighlights(dt: number) {
    (['NS', 'EW'] as Axis[]).forEach((axis) => {
      this.highlightTimers[axis] = Math.max(0, this.highlightTimers[axis] - dt);
    });
  }

  private spawnIfNeeded(time: number) {
    (['N', 'S', 'E', 'W'] as Dir[]).forEach((dir) => {
      const since = time - this.lastSpawn[dir];
      const interval = this.spawnInterval[dir] * 1000;
      if (since >= interval && this.lanes[dir].length < 14) {
        this.spawnCar(dir);
        this.lastSpawn[dir] = time;
      }
    });
  }

  private spawnCar(dir: Dir) {
    const speed = Phaser.Math.Between(60, 80);
    let x = this.center.x;
    let y = this.center.y;
    const offset = 96;
    if (dir === 'N') {
      x -= 48;
      y = this.scene.scale.height + offset;
    } else if (dir === 'S') {
      x += 48;
      y = -offset;
    } else if (dir === 'E') {
      x = -offset;
      y -= 48;
    } else {
      x = this.scene.scale.width + offset;
      y += 48;
    }
    const car = new Car(this.scene, x, y, dir, speed);
    this.lanes[dir].push(car);
  }

  private getAxis(dir: Dir): Axis {
    return dir === 'N' || dir === 'S' ? 'NS' : 'EW';
  }

  private moveCars(dt: number) {
    (['N', 'S', 'E', 'W'] as Dir[]).forEach((dir) => {
      const axis = this.getAxis(dir);
      const cars = this.lanes[dir];
      const green = this.light.isGreenFor(dir);
      const speedStep = (dt / 1000) * 1;
      for (let index = cars.length - 1; index >= 0; index -= 1) {
        const car = cars[index];
        const ahead = cars[index - 1];
        const spacing = ahead ? Phaser.Math.Distance.Between(car.x, car.y, ahead.x, ahead.y) : Infinity;
        let canMove = spacing > 50;
        const nearStop = this.isNearStopLine(car);
        if (!green && nearStop) {
          canMove = false;
        }
        const multiplier = canMove ? car.speed * speedStep : 0;
        switch (dir) {
          case 'N':
            car.y -= multiplier;
            break;
          case 'S':
            car.y += multiplier;
            break;
          case 'E':
            car.x += multiplier;
            break;
          case 'W':
            car.x -= multiplier;
            break;
        }
        const distanceFromCenter = Phaser.Math.Distance.Between(car.x, car.y, this.center.x, this.center.y);
        if (distanceFromCenter < 20) {
          car.state = 'CROSSING';
        }
        if (this.isOffscreen(car)) {
          car.destroy();
          cars.splice(index, 1);
          this.carsExited += 1;
          this.onCarExit();
        }
      }
    });
  }

  private isNearStopLine(car: Car) {
    const limit = 140;
    if (car.dir === 'N') {
      return car.y - this.center.y < limit;
    }
    if (car.dir === 'S') {
      return this.center.y - car.y < limit;
    }
    if (car.dir === 'E') {
      return this.center.x - car.x < limit;
    }
    return car.x - this.center.x < limit;
  }

  private isOffscreen(car: Car) {
    const margin = 120;
    return (
      car.x < -margin ||
      car.x > this.scene.scale.width + margin ||
      car.y < -margin ||
      car.y > this.scene.scale.height + margin
    );
  }

  getQueueCounts(): Record<Axis, number> {
    const queued = (dir: Dir) =>
      this.lanes[dir].filter((car) => car.state !== 'CROSSING' && this.isNearStopLine(car)).length;
    return {
      NS: queued('N') + queued('S'),
      EW: queued('E') + queued('W')
    };
  }

  releaseWorstLane(ms: number) {
    const queues = this.getQueueCounts();
    const axis: Axis = queues.NS >= queues.EW ? 'NS' : 'EW';
    this.releaseAxis(axis, ms);
  }

  releaseAxis(axis: Axis, ms: number) {
    this.highlightTimers[axis] = 260;
    this.light.force(axis, ms);
  }

  draw(g: Phaser.GameObjects.Graphics) {
    const { width, height } = this.scene.scale;
    const { x: cx, y: cy } = this.center;

    g.lineStyle(0, 0, 0);
    g.fillStyle(0x2d343c, 1);
    g.fillRect(cx - 90, 0, 180, height);
    g.fillRect(0, cy - 90, width, 180);

    if (this.highlightTimers.NS > 0) {
      g.fillStyle(0x7dffb3, 0.28);
      g.fillRect(cx - 88, cy - 160, 176, 320);
    }
    if (this.highlightTimers.EW > 0) {
      g.fillStyle(0xaed4ff, 0.28);
      g.fillRect(cx - 160, cy - 88, 320, 176);
    }

    g.lineStyle(4, 0xffffff, 0.7);
    g.strokeLineShape(new Phaser.Geom.Line(cx - 90, cy - 70, cx + 90, cy - 70));
    g.strokeLineShape(new Phaser.Geom.Line(cx - 90, cy + 70, cx + 90, cy + 70));
    g.strokeLineShape(new Phaser.Geom.Line(cx - 70, cy - 90, cx - 70, cy + 90));
    g.strokeLineShape(new Phaser.Geom.Line(cx + 70, cy - 90, cx + 70, cy + 90));
  }
}

type LetterCorrectPayload = {
  releaseMs: number;
  streak: number;
  milestone?: LetterMilestone;
  completed: boolean;
};

type WordCompletePayload = {
  word: string;
  releaseMs: number;
  streak: number;
};

class SpellingManager extends Phaser.Events.EventEmitter {
  private words: string[];
  private wordIndex = 0;
  private charIndex = 0;
  private streak = 0;
  private baseMs: number;

  constructor(words: string[], baseMs: number) {
    super();
    this.words = words;
    this.baseMs = baseMs;
  }

  get currentWord(): string {
    return this.words[this.wordIndex] ?? '';
  }

  get display(): string {
    const word = this.currentWord;
    if (!word) return '';
    const typed = word.slice(0, this.charIndex).toUpperCase();
    const pending = word.slice(this.charIndex).toLowerCase();
    return typed + pending;
  }

  attach(scene: Phaser.Scene) {
    scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const word = this.currentWord;
      if (!word) return;
      const key = event.key.toLowerCase();
      if (key === 'backspace') {
        if (this.charIndex > 0) {
          this.charIndex -= 1;
          this.emit('letter-backspace');
        }
        return;
      }
      if (key.length !== 1 || !/[a-z]/.test(key)) {
        return;
      }
      const expected = word[this.charIndex]?.toLowerCase();
      if (key === expected) {
        this.charIndex += 1;
        this.streak += 1;
        const ms = Phaser.Math.Clamp(this.baseMs + 200 * this.streak, 1200, 4000);
        const milestone = isMilestone(this.streak) ? this.streak : undefined;
        const payload: LetterCorrectPayload = {
          releaseMs: ms,
          streak: this.streak,
          milestone,
          completed: this.charIndex === word.length
        };
        this.emit('letter-correct', payload);
        if (this.charIndex === word.length) {
          const completePayload: WordCompletePayload = {
            word,
            releaseMs: ms + 600,
            streak: this.streak
          };
          this.emit('word-complete', completePayload);
          this.wordIndex = (this.wordIndex + 1) % this.words.length;
          this.charIndex = 0;
          this.emit('word-changed');
        }
      } else {
        this.streak = 0;
        this.emit('letter-wrong');
      }
    });
  }
}

export class GreenLightSquad extends Phaser.Scene {
  private traffic!: TrafficManager;
  private spelling!: SpellingManager;
  private graphics!: Phaser.GameObjects.Graphics;
  private wordText!: Phaser.GameObjects.Text;
  private subText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private flowText!: Phaser.GameObjects.Text;
  private replayHandler?: (event: Event) => void;

  private score = 0;
  private streak = 0;
  private bestStreak = 0;
  private wordsCompleted = 0;

  constructor() {
    super('GreenLightSquad');
  }

  create() {
    const words = getWordsForPlay().map((entry) => entry.text);
    if (words.length === 0) {
      this.cameras.main.setBackgroundColor('#18212a');
      this.add
        .text(512, 300, 'Add words on the Home page to start the traffic flow!', {
          fontFamily: 'Nunito',
          fontSize: '32px',
          color: '#f0f6ff',
          wordWrap: { width: 660 }
        })
        .setOrigin(0.5);
      return;
    }

    this.cameras.main.setBackgroundColor('#1f252d');
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.graphics = this.add.graphics();

    this.traffic = new TrafficManager(this, () => this.updateFlowText());
    this.traffic.init(centerX, centerY);

    this.wordText = this.add
      .text(centerX, 80, '', {
        fontFamily: 'Fredoka One',
        fontSize: '64px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.subText = this.add
      .text(centerX, 140, 'Type to turn the lights green!', {
        fontFamily: 'Nunito',
        fontSize: '26px',
        color: '#cbd7ff'
      })
      .setOrigin(0.5);

    this.scoreText = this.add
      .text(24, 20, '', {
        fontFamily: 'Nunito',
        fontSize: '28px',
        color: '#f8fbff'
      })
      .setOrigin(0, 0);

    this.flowText = this.add
      .text(24, 60, '', {
        fontFamily: 'Nunito',
        fontSize: '24px',
        color: '#d0e7ff'
      })
      .setOrigin(0, 0);

    this.spelling = new SpellingManager(words, 1400);
    this.spelling.attach(this);

    this.spelling.on('letter-correct', (payload: LetterCorrectPayload) => {
      const { releaseMs, streak, milestone, completed } = payload;
      this.score += 10;
      this.streak = streak;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      if (milestone) {
        this.score += 20;
        this.subText.setText(`Streak ${milestone}! Keep cars cruising!`);
      } else if (!completed) {
        this.subText.setText('Nice! Another lane is flowing.');
      }
      this.traffic.releaseWorstLane(releaseMs);
      this.refreshWordDisplay(true);
      this.updateScoreText();
    });

    this.spelling.on('letter-wrong', () => {
      this.streak = 0;
      this.subText.setText('Almost! Try that letter again.');
      this.flashWord(false);
      this.updateScoreText();
    });

    this.spelling.on('word-complete', (payload: WordCompletePayload) => {
      const { releaseMs } = payload;
      this.wordsCompleted += 1;
      this.score += 50;
      this.subText.setText('Green wave! 🚦 All clear!');
      this.traffic.releaseWorstLane(releaseMs);
      playSound('confetti');
      this.refreshWordDisplay(true);
      this.updateScoreText();
    });

    this.spelling.on('word-changed', () => {
      this.streak = 0;
      this.refreshWordDisplay();
      this.updateScoreText();
      this.playPrompt();
    });

    this.refreshWordDisplay();
    this.updateScoreText();
    this.playPrompt();

    this.replayHandler = (event: Event) => {
      const detail = (event as ReplayEvent).detail;
      if (detail?.gameKey === 'green-light-squad') {
        this.playPrompt();
      }
    };
    window.addEventListener(EVENT_REPLAY, this.replayHandler as EventListener);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener(EVENT_REPLAY, this.replayHandler as EventListener);
      this.input.keyboard?.removeAllListeners('keydown');
    });
  }

  private playPrompt() {
    const word = this.spelling?.currentWord;
    if (!word) return;
    void speak(word);
  }

  private refreshWordDisplay(flash = false) {
    if (!this.spelling) return;
    this.wordText.setText(this.spelling.display.toUpperCase());
    if (flash) {
      this.flashWord(true);
    }
  }

  private flashWord(success: boolean) {
    const color = success ? '#7affb0' : '#ff7a8c';
    this.wordText.setColor(color);
    this.time.delayedCall(160, () => this.wordText.setColor('#ffffff'));
  }

  private updateScoreText() {
    this.scoreText.setText(
      `Score: ${this.score}\nStreak: ${this.streak}  Best: ${this.bestStreak}\nWords cleared: ${this.wordsCompleted}`
    );
    this.updateFlowText();
  }

  private updateFlowText() {
    if (!this.traffic) return;
    this.flowText.setText(`Cars guided: ${this.traffic.carsExited}`);
  }

  update(time: number, delta: number) {
    if (!this.traffic) return;
    this.graphics.clear();
    this.traffic.update(time, delta);
    this.traffic.draw(this.graphics);
  }
}

