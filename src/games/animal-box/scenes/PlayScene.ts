import Phaser from 'phaser';
import { playClickTone, playErrorTone, playSuccessTone } from '../../../core/sfx';
import { speak } from '../../../core/tts';
import { sampleList } from '../../../lists/sample';
import {
  GameSession,
  clearSession,
  createSession,
  loadSession,
  pickNextWord,
  saveSession
} from '../session';
import {
  PromptHUDHandle,
  PromptHUDNotice,
  PromptHUDProps,
  createPromptHUD
} from '../hud/PromptHUD';

const BOX_FILL = 0xffffff;
const BOX_OPEN_FILL = 0xfff3c4;
const BOX_STROKE = 0x0f3057;
const BOX_READY_STROKE = 0x1b8a5a;

const DEFAULT_ANIMALS = [
  '🦊',
  '🐻',
  '🐼',
  '🦁',
  '🐯',
  '🐶',
  '🐱',
  '🐭',
  '🐹',
  '🐰',
  '🦉',
  '🐨',
  '🐸',
  '🐙',
  '🐧',
  '🐢'
];

const normalize = (value: string) =>
  value
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

type PlayData = {
  listId: string;
  listName: string;
  words: string[];
};

type BoxView = {
  index: number;
  card: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  opened: boolean;
};

export default class PlayScene extends Phaser.Scene {
  private session!: GameSession;
  private listId!: string;
  private listName!: string;
  private hud?: PromptHUDHandle;
  private inputValue = '';
  private awaitingBoxSelection = false;
  private boxes: BoxView[] = [];
  private notice: PromptHUDNotice | null = null;
  private hint = 'Type the word you hear';
  private boxSize = 0;
  private victoryShown = false;

  constructor() {
    super('play');
  }

  create(data: PlayData) {
    const listId = data?.listId ?? sampleList.id;
    const listName = data?.listName ?? sampleList.name;
    const words = (data?.words ?? sampleList.words).slice();
    const animalsPool = this.buildAnimalsPool(words.length);

    this.listId = listId;
    this.listName = listName;

    let session = loadSession(listId);
    if (
      !session ||
      session.words.length !== words.length ||
      session.words.some((word, index) => word !== words[index])
    ) {
      session = createSession(listId, words, animalsPool);
      saveSession(session);
    } else if (this.ensureAnimals(session, animalsPool)) {
      saveSession(session);
    }

    if (!session.currentWord && session.wordsPending.length) {
      pickNextWord(session);
      saveSession(session);
    }

    this.session = session;
    this.inputValue = '';
    this.notice = null;
    this.awaitingBoxSelection = false;
    this.victoryShown = false;

    if (this.session.wordsDone.length === this.session.words.length) {
      this.notice = { tone: 'success', message: 'All animals found!' };
      this.hint = 'All animals discovered!';
    } else {
      this.hint = 'Type the word you hear';
    }

    this.createGrid();
    this.mountHUD();
    this.updateHUD();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyHUD());

    if (this.session.currentWord) {
      this.time.delayedCall(300, () => this.playCurrentWord());
    }

    if (this.session.wordsDone.length === this.session.words.length) {
      this.time.delayedCall(400, () => this.showVictory());
    }
  }

  private buildAnimalsPool(count: number): string[] {
    const animals: string[] = [];
    for (let i = 0; i < count; i++) {
      animals.push(DEFAULT_ANIMALS[i % DEFAULT_ANIMALS.length]);
    }
    return animals;
  }

  private ensureAnimals(session: GameSession, pool: string[]): boolean {
    let changed = false;
    for (let i = 0; i < session.words.length; i++) {
      if (typeof session.animalByBox[i] !== 'string') {
        session.animalByBox[i] = pool[i % pool.length];
        changed = true;
      }
    }
    return changed;
  }

  private createGrid() {
    const total = this.session.words.length;
    const { width, height } = this.scale;

    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const pad = 12;
    const gridW = Math.min(width * 0.92, 900);
    const gridH = Math.min(height * 0.78, 640);
    const cellW = Math.floor((gridW - pad * (cols - 1)) / cols);
    const cellH = Math.floor((gridH - pad * (rows - 1)) / rows);
    const size = Math.min(cellW, cellH);
    const startX = (width - (size * cols + pad * (cols - 1))) / 2 + size / 2;
    const startY = (height - (size * rows + pad * (rows - 1))) / 2 + size / 2;

    this.boxSize = size;
    this.boxes = [];

    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = startX + c * (size + pad);
      const y = startY + r * (size + pad);
      this.boxes.push(this.createBox(i, x, y, size));
    }
  }

  private createBox(index: number, x: number, y: number, size: number): BoxView {
    const card = this.add
      .rectangle(x, y, size, size, BOX_FILL, 0.98)
      .setStrokeStyle(2, BOX_STROKE)
      .setInteractive({ useHandCursor: false });
    const label = this.add
      .text(x, y, String(index + 1), {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: Math.round(size * 0.34) + 'px',
        color: '#0f3057'
      })
      .setOrigin(0.5);

    const opened = this.session.openedBoxIndices.includes(index);
    const box: BoxView = { index, card, label, opened };

    card.on('pointerup', () => this.handleBoxSelected(index));

    if (opened) {
      this.revealAnimalInstant(box);
      card.disableInteractive();
    } else {
      card.disableInteractive();
    }

    return box;
  }

  private revealAnimalInstant(box: BoxView) {
    const animal = this.getAnimalDisplay(box.index);
    box.card.setFillStyle(BOX_OPEN_FILL, 1);
    box.card.setScale(1);
    box.label.setText(animal);
    box.label.setFontSize(Math.round(this.boxSize * 0.32));
    box.label.setColor('#0f3057');
    box.opened = true;
  }

  private getAnimalDisplay(index: number): string {
    const animal = this.session.animalByBox[index];
    return animal ?? DEFAULT_ANIMALS[index % DEFAULT_ANIMALS.length];
  }

  private mountHUD() {
    const parent = this.game.canvas?.parentElement;
    if (!parent) return;
    this.hud = createPromptHUD(parent, this.composeHUDProps());
  }

  private destroyHUD() {
    this.hud?.destroy();
    this.hud = undefined;
  }

  private composeHUDProps(): PromptHUDProps {
    return {
      value: this.inputValue,
      disabled: this.awaitingBoxSelection || !this.session.currentWord,
      canHear: Boolean(this.session.currentWord),
      progressDone: this.session.wordsDone.length,
      progressTotal: this.session.words.length,
      status: this.notice,
      hint: this.hint,
      onChange: this.handleInputChange,
      onSubmit: this.handleSubmit,
      onHear: this.handleHear,
      onAppend: this.handleAppend,
      onBackspace: this.handleBackspace
    };
  }

  private updateHUD(nextHint?: string) {
    if (typeof nextHint === 'string') {
      this.hint = nextHint;
    }
    if (!this.hud) return;
    this.hud.update(this.composeHUDProps());
  }

  private handleInputChange = (value: string) => {
    this.inputValue = value;
    if (this.notice?.tone === 'error') {
      this.notice = null;
    }
    this.updateHUD();
  };

  private handleAppend = (char: string) => {
    if (this.awaitingBoxSelection || !this.session.currentWord) return;
    this.inputValue += char;
    if (this.notice?.tone === 'error') {
      this.notice = null;
    }
    playClickTone();
    this.updateHUD();
  };

  private handleBackspace = () => {
    if (this.awaitingBoxSelection || !this.inputValue.length) return;
    this.inputValue = this.inputValue.slice(0, -1);
    if (this.notice?.tone === 'error') {
      this.notice = null;
    }
    playClickTone();
    this.updateHUD();
  };

  private handleHear = () => {
    if (!this.session.currentWord || this.awaitingBoxSelection) return;
    playClickTone();
    this.playCurrentWord();
  };

  private handleSubmit = () => {
    if (!this.session.currentWord || this.awaitingBoxSelection) return;
    if (!this.inputValue.trim()) {
      this.notice = { tone: 'info', message: 'Type the word you hear first.' };
      this.updateHUD();
      return;
    }

    const correct = normalize(this.inputValue) === normalize(this.session.currentWord);
    if (correct) {
      this.awaitingBoxSelection = true;
      this.notice = { tone: 'success', message: 'Great! Pick a box to open.' };
      this.updateHUD('Tap a box to reveal your animal!');
      this.enableSelectableBoxes();
    } else {
      playErrorTone();
      this.notice = { tone: 'error', message: 'Not quite—try again!' };
      this.updateHUD();
    }
  };

  private enableSelectableBoxes() {
    this.boxes.forEach((box) => {
      if (box.opened) return;
      box.card.setStrokeStyle(3, BOX_READY_STROKE);
      box.card.setInteractive({ useHandCursor: true });
      this.tweens.add({
        targets: box.card,
        scale: 1.05,
        duration: 160,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    });
  }

  private disableSelectableBoxes() {
    this.boxes.forEach((box) => {
      if (box.opened) return;
      box.card.setStrokeStyle(2, BOX_STROKE);
      box.card.disableInteractive();
      box.card.setScale(1);
    });
  }

  private handleBoxSelected(index: number) {
    const box = this.boxes[index];
    if (!box || box.opened) return;
    if (!this.awaitingBoxSelection) return;

    const currentWord = this.session.currentWord;
    if (!currentWord) return;

    this.disableSelectableBoxes();
    this.notice = null;
    this.updateHUD('Opening the box…');

    box.card.disableInteractive();
    box.opened = true;

    const animal = this.getAnimalDisplay(index);
    playSuccessTone();

    this.tweens.add({
      targets: [box.card, box.label],
      scaleX: 0.1,
      duration: 150,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onYoyo: () => {
        box.card.setFillStyle(BOX_OPEN_FILL, 1);
        box.label.setText(animal);
        box.label.setFontSize(Math.round(this.boxSize * 0.32));
        box.label.setColor('#0f3057');
      },
      onComplete: () => {
        box.card.setScale(1);
        box.label.setScale(1);
        this.afterBoxOpened(currentWord, index);
      }
    });
  }

  private afterBoxOpened(word: string, index: number) {
    this.awaitingBoxSelection = false;

    const pendingIdx = this.session.wordsPending.indexOf(word);
    if (pendingIdx >= 0) {
      this.session.wordsPending.splice(pendingIdx, 1);
    }
    this.session.wordsDone.push(word);
    if (!this.session.openedBoxIndices.includes(index)) {
      this.session.openedBoxIndices.push(index);
      this.session.openedBoxIndices.sort((a, b) => a - b);
    }
    this.session.currentWord = undefined;
    saveSession(this.session);

    if (this.session.wordsDone.length === this.session.words.length) {
      this.notice = { tone: 'success', message: 'All animals found!' };
      this.hint = 'All animals discovered!';
      this.updateHUD();
      this.showVictory();
      return;
    }

    pickNextWord(this.session);
    saveSession(this.session);

    this.inputValue = '';
    this.notice = null;
    this.updateHUD('Type the word you hear');
    this.time.delayedCall(400, () => this.playCurrentWord());
  }

  private playCurrentWord() {
    if (!this.session.currentWord) return;
    speak(this.session.currentWord);
  }

  private showVictory() {
    if (this.victoryShown) return;
    this.victoryShown = true;

    const { width, height } = this.scale;
    const container = this.add.container(0, 0).setDepth(50).setAlpha(0);

    const overlay = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.45)
      .setInteractive({ useHandCursor: false });
    const panelWidth = Math.min(420, width * 0.8);
    const panelHeight = Math.min(320, height * 0.6);
    const panel = this.add
      .rectangle(width / 2, height / 2, panelWidth, panelHeight, 0xffffff, 0.97)
      .setStrokeStyle(3, BOX_STROKE);

    const title = this.add
      .text(width / 2, height / 2 - panelHeight * 0.28, 'All animals found!', {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#0f3057',
        align: 'center'
      })
      .setOrigin(0.5);

    const summary = this.add
      .text(width / 2, height / 2 - panelHeight * 0.08, this.listName, {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: '20px',
        color: '#374151',
        align: 'center',
        wordWrap: { width: panelWidth - 48 }
      })
      .setOrigin(0.5);

    const boxesOpened = `${this.session.wordsDone.length} / ${this.session.words.length} boxes opened`;
    const progress = this.add
      .text(width / 2, height / 2 + panelHeight * 0.1, boxesOpened, {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: '18px',
        color: '#0f3057'
      })
      .setOrigin(0.5);

    container.add([overlay, panel, title, summary, progress]);

    this.createVictoryButton(
      container,
      width / 2,
      height / 2 + panelHeight * 0.26,
      panelWidth - 80,
      'Replay with same list',
      () => {
        clearSession(this.listId);
        this.scene.restart({ listId: this.listId, listName: this.listName, words: this.session.words });
      }
    );

    this.createVictoryButton(
      container,
      width / 2,
      height / 2 + panelHeight * 0.42,
      panelWidth - 80,
      'Back to lists',
      () => {
        this.scene.start('menu');
      }
    );

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 220,
      ease: 'Sine.easeOut'
    });
  }

  private createVictoryButton(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    width: number,
    label: string,
    onClick: () => void
  ) {
    const button = this.add
      .rectangle(x, y, width, 52, 0xf8d05d, 1)
      .setStrokeStyle(2, BOX_STROKE)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Nunito, system-ui, sans-serif',
        fontSize: '20px',
        color: '#0f3057'
      })
      .setOrigin(0.5);

    button.on('pointerdown', () => playClickTone());
    button.on('pointerup', () => {
      button.disableInteractive();
      onClick();
    });

    container.add([button, text]);
  }
}
