export type Evidence = { year: string; kind: 'brain' | 'phil'; title: string; who: string; says: string; catch: string };

export const EVIDENCE: Evidence[] = [
  {
    year: '1677', kind: 'phil', title: 'Freedom is ignorance of causes', who: 'Baruch Spinoza, Ethics',
    says: 'People believe they are free because they are aware of their wants but not of the causes that produced those wants. A falling stone that could think would believe it fell freely.',
    catch: 'A metaphysical argument, not evidence. It assumes everything is caused, which is the thing in dispute.',
  },
  {
    year: '1748', kind: 'phil', title: 'Freedom is doing what you will', who: 'David Hume, An Enquiry Concerning Human Understanding',
    says: 'Liberty means acting according to your own will rather than being restrained. Causation doesn\'t undermine that. It is what makes your actions yours. This is the root of compatibilism.',
    catch: "Kant called it a 'wretched subterfuge': if your will was fixed before you were born, doing what you will doesn't seem free.",
  },
  {
    year: '1969', kind: 'phil', title: 'Frankfurt cases', who: 'Harry Frankfurt, Journal of Philosophy',
    says: 'A person can be morally responsible even when they could not have done otherwise, as with Jones in the quiz. That breaks the link between responsibility and alternative possibilities.',
    catch: "Libertarians argue there is always a 'flicker' of freedom left: the moment Jones starts to decide on his own.",
  },
  {
    year: '1983', kind: 'brain', title: 'The readiness potential', who: 'Benjamin Libet et al., Brain',
    says: 'EEG showed brain activity building about 550 ms before a spontaneous wrist flick, while people reported the urge about 200 ms before. The brain seemed to start before conscious intention.',
    catch: "The movements were meaningless, and the clock reports are unreliable. Libet himself believed people keep a conscious 'veto'.",
  },
  {
    year: '1983', kind: 'phil', title: 'The Consequence Argument', who: 'Peter van Inwagen, An Essay on Free Will',
    says: "If determinism is true, our acts follow from laws of nature and events before we were born. We control neither, so we don't control their consequences, including our acts.",
    catch: "Compatibilists reject the step that says 'no control over the inputs means no control over the outputs'.",
  },
  {
    year: '1994', kind: 'phil', title: 'The Basic Argument', who: 'Galen Strawson, Philosophical Studies',
    says: "You do what you do because of the way you are. To be truly responsible you'd have to have made yourself the way you are, which requires an earlier self, and so on forever.",
    catch: 'Most compatibilists say no one needs ultimate self-creation. Ordinary responsibility is enough.',
  },
  {
    year: '2008', kind: 'brain', title: 'Predicting choices seconds ahead', who: 'Soon, Brass, Heinze & Haynes, Nature Neuroscience',
    says: 'fMRI patterns predicted whether people would press a left or right button up to 7–10 seconds before they reported deciding.',
    catch: 'Accuracy was about 60%, where 50% is chance. That is a weak bias, not a decision already made.',
  },
  {
    year: '2008', kind: 'brain', title: 'Disbelief and cheating', who: 'Vohs & Schooler, Psychological Science',
    says: 'People who read a passage arguing that free will is an illusion cheated more on a test afterward.',
    catch: 'Later, larger replication attempts mostly failed to find the effect.',
  },
  {
    year: '2011', kind: 'brain', title: 'Single neurons fire first', who: 'Fried, Mukamel & Kreiman, Neuron',
    says: "Electrodes in epilepsy patients' brains recorded single neurons that predicted a decision to move about 700 ms before awareness, with roughly 80% accuracy.",
    catch: "Still simple, arbitrary finger movements. It shows where intentions build up, not that they aren't yours.",
  },
  {
    year: '2012', kind: 'brain', title: 'The readiness potential might be noise', who: 'Schurger, Sitt & Dehaene, PNAS',
    says: "A model in which random neural activity drifts until it crosses a threshold reproduces the readiness potential. The 'decision' may happen near the threshold, close to when people feel it.",
    catch: "This doesn't prove free will. It removes the main neuroscience argument against it.",
  },
  {
    year: '2016', kind: 'brain', title: 'The point of no return', who: 'Schultze-Kraft et al., PNAS',
    says: "A computer read people's readiness potentials live and flashed a stop signal. They could cancel a movement until about 200 ms before it began.",
    catch: "Supports something like Libet's veto, though the veto could itself be prepared unconsciously.",
  },
  {
    year: '2019', kind: 'brain', title: 'Arbitrary vs. deliberate choices', who: 'Maoz, Yaffe, Koch & Mudrik, eLife',
    says: 'People chose which charity got a real $1,000 donation. The readiness potential appeared for arbitrary choices but was absent for meaningful ones.',
    catch: 'Suggests the classic experiments studied the wrong kind of choice. The decisions people care about may work differently.',
  },
  {
    year: '2023', kind: 'phil', title: 'Determined', who: 'Robert Sapolsky, Determined: A Science of Life Without Free Will',
    says: "A neurobiologist's book-length case that every act follows from genes, hormones, upbringing and circumstance, and that blame and punishment should be rethought.",
    catch: 'Philosophers reply that it attacks a libertarian idea of free will few of them hold. It largely ignores compatibilism.',
  },
];

export const IN_SHORT = [
  {
    label: 'What the science shows',
    text: 'Brain activity can predict some simple, arbitrary choices before people report deciding, but only modestly (60–80%) and only for choices that don\'t matter to the person.',
  },
  {
    label: "What it doesn't show",
    text: "That deliberate, meaningful decisions are made without you. \"You\" are your brain, so the brain starting first may just be you starting first.",
  },
  {
    label: 'Where that leaves it',
    text: "The question is mostly about what \"free\" should mean. If it means acting on your own reasons without coercion, most of us have it. If it means you could have done otherwise with the exact same past, nobody knows how that could work.",
  },
];
