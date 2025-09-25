const ANIMALS = [
  'cat',
  'dog',
  'bunny',
  'turtle',
  'fox',
  'panda',
  'koala',
  'penguin',
  'lion',
  'tiger',
  'giraffe',
  'elephant',
  'hippo',
  'zebra',
  'monkey',
  'owl',
  'dolphin',
  'whale',
  'parrot',
  'frog',
  'raccoon',
  'squirrel',
  'deer',
  'llama',
  'sloth'
];

let lastAnimal = '';

export function nextAnimal(): string {
  if (ANIMALS.length === 0) return '';
  let pick = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  if (pick === lastAnimal) {
    pick = ANIMALS[(ANIMALS.indexOf(pick) + 1) % ANIMALS.length];
  }
  lastAnimal = pick;
  return pick;
}

export function resetAnimals() {
  lastAnimal = '';
}

export function allAnimals() {
  return [...ANIMALS];
}
