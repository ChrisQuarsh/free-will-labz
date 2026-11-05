export type Question = { t: string; c?: 1 | -1; e?: 1 | -1 };

// c: loads on "determinism is compatible with free will"; e: loads on "we have free will".
export const QUESTIONS: Question[] = [
  { t: 'Even if every thought you have was fixed by earlier causes, you could still choose freely.', c: 1 },
  {
    t: 'Jones decides on his own to vote for Smith. Unknown to him, a neuroscientist would have forced that vote if he had wavered. He never wavers. Jones is still responsible for his vote.',
    c: 1,
  },
  { t: 'To act freely, you must have been able to do otherwise, given exactly the same past.', c: -1 },
  { t: "Someone raised and shaped by a manipulative cult is less to blame for their crimes than someone who wasn't.", c: -1 },
  { t: 'When I deliberate, the outcome is genuinely open until the moment I decide.', e: 1 },
  { t: 'Experiments that predict choices from brain activity show free will is an illusion.', e: -1 },
  { t: 'Some people deserve punishment for what they did, beyond what it takes to protect others.', e: 1 },
  { t: 'Our everyday idea of free will is basically accurate.', e: 1 },
];

export const SCALE = ['Strongly disagree', 'Disagree', 'Unsure', 'Agree', 'Strongly agree'];

export type PositionKey = 'compat' | 'lib' | 'skep' | 'rev';

export const POSITIONS: Record<PositionKey, { name: string; desc: string; people: string }> = {
  compat: {
    name: 'Compatibilist',
    desc: "Free will means acting on your own reasons, without coercion. Determinism doesn't threaten that. This is the most common view among philosophers.",
    people: 'In good company with David Hume, Harry Frankfurt and Daniel Dennett.',
  },
  lib: {
    name: 'Libertarian',
    desc: "Free will is real, and it needs the future to be genuinely open. If everything were determined, you wouldn't truly choose.",
    people: "In good company with Robert Kane, Timothy O'Connor and, in a sense, Kant.",
  },
  skep: {
    name: 'Free will skeptic',
    desc: 'Free will in the sense that matters would need an open future, and nothing about the brain provides one. Your choices are real events, but not ultimately up to you.',
    people: 'In good company with Spinoza, Galen Strawson, Derk Pereboom and Robert Sapolsky.',
  },
  rev: {
    name: 'Revisionist',
    desc: "Determinism isn't the problem, but our everyday idea of free will is muddled and promises too much. Keep the useful parts (responsibility, self-control) and drop the rest.",
    people: "In good company with Manuel Vargas and parts of Dennett's later work.",
  },
};

/** PhilPapers Survey 2020, target faculty, rounded. */
export const SURVEY: { label: string; pct: number; key: PositionKey }[] = [
  { label: 'Compatibilism', pct: 59, key: 'compat' },
  { label: 'Libertarianism', pct: 19, key: 'lib' },
  { label: 'No free will', pct: 11, key: 'skep' },
  { label: 'Other', pct: 11, key: 'rev' },
];

/** Answers are -2..2 or null. Returns axis scores, each in -8..8. */
export function score(answers: (number | null)[]) {
  let C = 0;
  let E = 0;
  QUESTIONS.forEach((q, i) => {
    const a = answers[i] ?? 0;
    if (q.c) C += q.c * a;
    if (q.e) E += q.e * a;
  });
  return { C, E };
}

export function classify(C: number, E: number): PositionKey {
  if (C >= 0) return E >= -1 ? 'compat' : 'rev';
  return E >= 0 ? 'lib' : 'skep';
}
