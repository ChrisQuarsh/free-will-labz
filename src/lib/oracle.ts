export type Choice = 'L' | 'R';
export type Press = { k: Choice; hit: boolean };

/**
 * The Aaronson oracle: remembers what followed every sequence of up to 5 presses
 * and predicts the majority. It never sees the press it is guessing.
 */
export class Oracle {
  private counts = new Map<string, [number, number]>();
  readonly history: Choice[] = [];

  static fromHistory(keys: Choice[]) {
    const o = new Oracle();
    keys.forEach((k) => o.learn(k));
    return o;
  }

  predict(): Choice {
    for (let n = Math.min(5, this.history.length); n >= 1; n--) {
      const c = this.counts.get(this.history.slice(-n).join(''));
      if (c && c[0] !== c[1]) return c[0] > c[1] ? 'L' : 'R';
    }
    return Math.random() < 0.5 ? 'L' : 'R';
  }

  learn(k: Choice) {
    for (let n = 1; n <= Math.min(5, this.history.length); n++) {
      const key = this.history.slice(-n).join('');
      const c = this.counts.get(key) ?? [0, 0];
      c[k === 'L' ? 0 : 1]++;
      this.counts.set(key, c);
    }
    this.history.push(k);
  }
}

/** Plays the oracle against Math.random and returns the share it predicted. */
export function coinTrial(rounds = 200): number {
  const o = new Oracle();
  let hits = 0;
  for (let i = 0; i < rounds; i++) {
    const g = o.predict();
    const k: Choice = Math.random() < 0.5 ? 'L' : 'R';
    if (g === k) hits++;
    o.learn(k);
  }
  return hits / rounds;
}

export function verdict(presses: Press[]): { title: string; body: string } {
  const n = presses.length;
  if (n < 30) {
    return {
      title: `Waiting for 30 presses${n ? ` (${30 - n} to go)` : ''}`,
      body: 'Early guesses are close to a coin flip because the machine has nothing to learn from yet. It gets sharper as it watches you.',
    };
  }
  const a = (presses.filter((p) => p.hit).length / n) * 100;
  const pct = Math.round(a);
  if (a >= 65)
    return {
      title: `Highly predictable · ${pct}%`,
      body: "Your 'random' presses have strong habits. That's the normal result. Humans are bad at producing randomness on purpose.",
    };
  if (a >= 56)
    return {
      title: `A typical human · ${pct}%`,
      body: 'The machine is beating chance by a clear margin. You avoid repeats or fall into rhythms without noticing.',
    };
  if (a >= 45)
    return {
      title: `Close to a coin · ${pct}%`,
      body: 'Very hard to read. Try 50 more presses. Most people drift into patterns as they get tired.',
    };
  return {
    title: `Contrarian · ${pct}%`,
    body: "You're beating it by doing the opposite of what you expect it to expect. That is a pattern too, just a different one.",
  };
}
