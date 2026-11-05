import { useRef } from 'react';
import { Pressable, Text, View, type ScrollViewInstance } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';

import { Button, Card, Header, Label, Screen, T, useWidth } from '../components/ui';
import { haptic } from '../lib/haptics';
import { classify, POSITIONS, QUESTIONS, SCALE, score, SURVEY } from '../lib/stance';
import { usePersistentState } from '../lib/storage';
import { fonts, useTheme } from '../theme';

const EMPTY: (number | null)[] = QUESTIONS.map(() => null);

export default function StanceScreen() {
  const c = useTheme();
  const [answers, setAnswers] = usePersistentState<(number | null)[]>('stance.answers', EMPTY);
  const scroll = useRef<ScrollViewInstance>(null);
  const resultY = useRef(0);

  const done = answers.filter((a) => a !== null).length;
  const { C, E } = score(answers);
  const key = done ? classify(C, E) : null;
  const pos = key ? POSITIONS[key] : null;

  function answer(i: number, v: number) {
    haptic.tick();
    const next = answers.map((a, j) => (j === i ? v : a));
    setAnswers(next);
    if (next.every((a) => a !== null) && answers.some((a) => a === null)) {
      setTimeout(() => scroll.current?.scrollTo({ y: resultY.current - 12, animated: true }), 250);
    }
  }

  return (
    <Screen ref={scroll}>
      <Header eyebrow="Experiment 3 · Your View" title="Where do you stand?">
        Philosophers split the question in two. Would determinism (every event fixed by earlier causes) rule out free
        will? And do we actually have it? Your answers place you on both.
      </Header>

      {QUESTIONS.map((q, i) => (
        <Card key={i} style={{ gap: 12 }}>
          <Label>{`Question ${i + 1} of ${QUESTIONS.length}`}</Label>
          <T>{q.t}</T>
          <View style={{ flexDirection: 'row', gap: 4 }} accessibilityRole="radiogroup">
            {SCALE.map((s, j) => {
              const v = j - 2;
              const on = answers[i] === v;
              return (
                <Pressable
                  key={s}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  accessibilityLabel={s}
                  onPress={() => answer(i, v)}
                  style={({ pressed }) => ({
                    flex: 1,
                    minHeight: 52,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: on ? c.you : c.line,
                    backgroundColor: on ? c.you : pressed ? c.youSoft : c.paper,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 2,
                  })}
                >
                  <Text style={{ fontSize: 11, lineHeight: 14, textAlign: 'center', color: on ? c.onYou : c.muted, fontWeight: on ? '700' : '400' }}>
                    {s.replace(' ', '\n')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      ))}

      <View onLayout={(e) => (resultY.current = e.nativeEvent.layout.y)}>
        <Card style={{ borderColor: c.you, borderWidth: 2 }}>
          <Label>{done === QUESTIONS.length ? 'Your position' : `Your position · ${done} of ${QUESTIONS.length} answered`}</Label>
          <Text style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 33, color: c.ink }}>
            {pos ? `${done < QUESTIONS.length ? 'Leaning ' : ''}${pos.name}` : 'Answer to find out'}
          </Text>
          <T muted small>{pos ? pos.desc : 'Each answer moves your dot on the map below.'}</T>
          <PositionMap C={done ? C : null} E={E} />
          {pos && <T small bold>{pos.people}</T>}
          <View style={{ gap: 8 }}>
            <Label>What professional philosophers think · PhilPapers 2020</Label>
            {SURVEY.map((s) => {
              const mine = s.key === key;
              return (
                <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ width: 118, fontSize: 13, color: c.ink, fontWeight: mine ? '700' : '400' }}>
                    {s.label}
                    {mine ? ' (you)' : ''}
                  </Text>
                  <View style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: c.paper, overflow: 'hidden' }}>
                    <View style={{ width: `${s.pct}%`, height: '100%', borderRadius: 6, backgroundColor: mine ? c.you : c.muted }} />
                  </View>
                  <Text style={{ width: 36, textAlign: 'right', fontSize: 13, fontFamily: fonts.mono, color: c.ink }}>{s.pct}%</Text>
                </View>
              );
            })}
          </View>
          {done > 0 && <Button title="Clear my answers" onPress={() => setAnswers(EMPTY)} />}
        </Card>
      </View>
    </Screen>
  );
}

function PositionMap({ C, E }: { C: number | null; E: number }) {
  const c = useTheme();
  const { width, onLayout } = useWidth();
  const W = 320, H = 260, L = 10, Tp = 22, pw = W - 20, ph = H - Tp - 30;
  const x = (v: number) => L + ((v + 8) / 16) * pw;
  const y = (v: number) => Tp + ((8 - v) / 16) * ph;
  const label = (tx: number, ty: number, s: string) => (
    <SvgText x={tx} y={ty} textAnchor="middle" fontFamily={fonts.displayBold} fontSize={13} fill={c.muted}>
      {s}
    </SvgText>
  );
  return (
    <View onLayout={onLayout}>
      <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
        <Rect x={L} y={Tp} width={pw} height={ph} rx={10} fill={c.paper} />
        <Line x1={x(0)} x2={x(0)} y1={Tp} y2={Tp + ph} stroke={c.line} strokeWidth={1.5} />
        <Line x1={L} x2={L + pw} y1={y(0)} y2={y(0)} stroke={c.line} strokeWidth={1.5} />
        {label(x(-4), y(6.4), 'Libertarian')}
        {label(x(4), y(6.4), 'Compatibilist')}
        {label(x(-4), y(-6), 'Skeptic')}
        {label(x(4), y(-6), 'Revisionist')}
        <SvgText x={L} y={Tp - 8} fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
          ↑ we have free will
        </SvgText>
        <SvgText x={L} y={H - 8} fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
          ← incompatible
        </SvgText>
        <SvgText x={L + pw} y={H - 8} textAnchor="end" fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
          compatible →
        </SvgText>
        {C != null && (
          <>
            <Circle cx={x(C)} cy={y(E)} r={16} fill={c.you} opacity={0.18} />
            <Circle cx={x(C)} cy={y(E)} r={7} fill={c.you} stroke={c.surface} strokeWidth={2} />
          </>
        )}
      </Svg>
    </View>
  );
}
