import { memo, useEffect, useRef, useState } from 'react';
import { Platform, Alert, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';

import { Button, Card, H3, Header, Label, Screen, T, useWidth } from '../components/ui';
import { haptic } from '../lib/haptics';
import { usePersistentState } from '../lib/storage';
import { fonts, useTheme, type Palette } from '../theme';

const PERIOD = 2560; // ms per revolution, the speed Libet used
const VB = 340; // clock viewBox size
const C = VB / 2;
const ORBIT = 96;

type Phase = 'idle' | 'spin' | 'after' | 'mark' | 'done';

const fracAt = (t: number, t0: number) => ((((t - t0) % PERIOD) + PERIOD) % PERIOD) / PERIOD;
const polar = (frac: number, r: number) => {
  const a = frac * Math.PI * 2 - Math.PI / 2;
  return { x: C + Math.cos(a) * r, y: C + Math.sin(a) * r };
};

export default function LibetScreen() {
  const c = useTheme();
  const [phase, setPhase] = useState<Phase>('idle');
  const [message, setMessage] = useState('Tap Start. The dot goes round once every 2.56 seconds, the same speed Libet used.');
  const [mark, setMark] = useState<number | null>(null);
  const [trials, setTrials] = usePersistentState<number[]>('libet.trials', []);
  const [t0, setT0] = useState(0);
  const pressFrac = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width, onLayout } = useWidth(300);
  const size = Math.min(width, 330);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function start() {
    setT0(Date.now() - Math.random() * PERIOD);
    setMark(null);
    setPhase('spin');
    setMessage("Watch the dot. Don't plan it. When the urge to tap arrives on its own, tap the button.");
  }

  function urge() {
    if (phase !== 'spin') return;
    pressFrac.current = fracAt(Date.now(), t0);
    haptic.thud();
    setPhase('after');
    setMessage("Tapped. Keep watching for a moment so the dot doesn't stop where you tapped.");
    timer.current = setTimeout(() => {
      setPhase('mark');
      setMessage('Where was the dot when you FIRST felt the urge? Touch that spot on the clock.');
    }, 1200 + Math.random() * 1300);
  }

  function confirm() {
    if (mark == null) return;
    let d = mark - pressFrac.current;
    d = (((d + 0.5) % 1) + 1) % 1 - 0.5;
    const ms = Math.round(d * PERIOD);
    setTrials((prev) => [...prev, ms]);
    setPhase('done');
    haptic.success();
    setMessage(
      ms <= 0
        ? `You felt the urge ${-ms} ms before you tapped. Libet's subjects averaged about 200 ms.`
        : `You placed the urge ${ms} ms after your tap. That happens. These reports are noisy, which is one of the main criticisms of the experiment.`,
    );
  }

  function clearTrials() {
    const go = () => setTrials([]);
    if (Platform.OS === 'web') return go();
    Alert.alert('Clear all trials?', 'Your average will reset.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: go },
    ]);
  }

  const mean = trials.length ? Math.round(trials.reduce((a, b) => a + b, 0) / trials.length) : null;

  const lastTick = useRef(-1);
  function onTouch(e: GestureResponderEvent) {
    if (phase !== 'mark') return;
    const s = VB / size;
    const dx = e.nativeEvent.locationX * s - C;
    const dy = e.nativeEvent.locationY * s - C;
    const f = ((Math.atan2(dy, dx) + Math.PI / 2) / (Math.PI * 2) + 1) % 1;
    const tick = Math.round(f * 60) % 60;
    if (tick !== lastTick.current) {
      lastTick.current = tick;
      haptic.tick();
    }
    setMark(f);
  }

  return (
    <Screen>
      <Header eyebrow="Experiment 2 · Libet Clock" title="When did you decide?">
        In 1983 Benjamin Libet asked people to move whenever they felt like it while watching a dot circle a clock. Their
        brains showed a build-up of activity about 550 ms before the movement, but people reported the urge only about
        200 ms before. Run the same task on yourself.
      </Header>

      <Card style={{ alignItems: 'center' }}>
        <View onLayout={onLayout} style={{ width: '100%', alignItems: 'center' }}>
          <View
            style={{ width: size, height: size }}
            onStartShouldSetResponder={() => phase === 'mark'}
            onMoveShouldSetResponder={() => phase === 'mark'}
            onResponderTerminationRequest={() => false}
            onResponderGrant={onTouch}
            onResponderMove={onTouch}
            accessibilityLabel="Libet clock"
            accessibilityHint={phase === 'mark' ? 'Touch where the dot was when you first felt the urge' : undefined}
          >
            <ClockFace size={size} c={c} />
            {(phase === 'spin' || phase === 'after') && <SpinningDot size={size} t0={t0} color={c.machine} />}
            {phase === 'mark' && mark != null && <Marker size={size} frac={mark} color={c.you} />}
          </View>
        </View>
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontFamily: fonts.displayBold, fontSize: 17, lineHeight: 22, color: c.ink, textAlign: 'center', minHeight: 44 }}
        >
          {message}
        </Text>
        <View style={{ width: '100%', gap: 10 }}>
          {(phase === 'idle' || phase === 'done') && (
            <Button big variant="primary" title={phase === 'idle' ? 'Start' : 'Next trial'} onPress={start} />
          )}
          {phase === 'spin' && <Button big variant="primary" title="I feel the urge" onPress={urge} />}
          {phase === 'after' && <Button big variant="primary" title="Keep watching…" onPress={() => {}} disabled />}
          {phase === 'mark' && (
            <>
              <Button big variant="primary" title="Confirm this spot" onPress={confirm} disabled={mark == null} />
              <Button title="Skip this trial" onPress={start} />
            </>
          )}
        </View>
      </Card>

      <Card>
        <H3>Your timeline vs. Libet’s</H3>
        <Timeline mine={mean} />
        <View>
          <Row left={<Label>Trial</Label>} right={<Label>Urge felt</Label>} />
          {trials.length === 0 ? (
            <T muted small style={{ paddingVertical: 8 }}>
              No trials yet. Five or more gives a steadier average.
            </T>
          ) : (
            <>
              {trials.map((ms, i) => (
                <Row key={i} left={<T small>{i + 1}</T>} right={<T small style={{ fontFamily: fonts.mono }}>{fmt(ms)}</T>} />
              ))}
              <Row
                left={<T small bold>Your average</T>}
                right={<T small style={{ fontFamily: fonts.monoBold, color: c.you }}>{fmt(mean ?? 0)}</T>}
              />
            </>
          )}
        </View>
        {trials.length > 0 && <Button title="Clear trials" onPress={clearTrials} />}
      </Card>

      <Card>
        <H3>Reading it</H3>
        <T muted small>
          A negative number means you reported the urge before your tap. Libet’s subjects averaged about −200 ms. Your
          phone can’t see your brain, so the brain-activity curve comes from Libet’s EEG data, not yours.
        </T>
        <H3>The twist</H3>
        <T muted small>
          In 2012 Aaron Schurger showed the “readiness potential” can come from random neural noise drifting toward a
          threshold. It may not be a hidden decision at all. See the Evidence tab.
        </T>
      </Card>
    </Screen>
  );
}

function fmt(ms: number) {
  return `${ms > 0 ? '+' : ms < 0 ? '−' : ''}${Math.abs(ms)} ms`;
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  const c = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 7,
        borderBottomWidth: 1,
        borderBottomColor: c.line,
      }}
    >
      {left}
      {right}
    </View>
  );
}

const ClockFace = memo(function ClockFace({ size, c }: { size: number; c: Palette }) {
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const big = i % 5 === 0;
    const a = polar(i / 60, 152);
    const b = polar(i / 60, big ? 132 : 142);
    return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={big ? c.ink : c.muted} strokeWidth={big ? 2.5 : 1.2} />;
  });
  const nums = Array.from({ length: 12 }, (_, i) => {
    const p = polar(i / 12, 116);
    return (
      <SvgText key={i} x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fontFamily={fonts.monoBold} fill={c.muted}>
        {String(i * 5)}
      </SvgText>
    );
  });
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={{ position: 'absolute' }} pointerEvents="none">
      <Circle cx={C} cy={C} r={162} fill={c.paper} stroke={c.ink} strokeWidth={2} />
      {ticks}
      {nums}
      <Circle cx={C} cy={C} r={4} fill={c.ink} />
    </Svg>
  );
});

/** Owns its own animation loop so only the dot re-renders each frame. */
function SpinningDot({ size, t0, color }: { size: number; t0: number; color: string }) {
  const [frac, setFrac] = useState(() => fracAt(Date.now(), t0));
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setFrac(fracAt(Date.now(), t0));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [t0]);
  const p = polar(frac, ORBIT);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={{ position: 'absolute' }} pointerEvents="none">
      <Circle cx={p.x} cy={p.y} r={11} fill={color} />
    </Svg>
  );
}

function Marker({ size, frac, color }: { size: number; frac: number; color: string }) {
  const p = polar(frac, ORBIT);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VB} ${VB}`} style={{ position: 'absolute' }} pointerEvents="none">
      <Line x1={C} y1={C} x2={p.x} y2={p.y} stroke={color} strokeWidth={3} />
      <Circle cx={p.x} cy={p.y} r={11} fill={color} />
    </Svg>
  );
}

function Timeline({ mine }: { mine: number | null }) {
  const c = useTheme();
  const { width, onLayout } = useWidth();
  const W = 420, H = 170, L = 18, R = 18, lo = -1000, hi = 300, ay = 96;
  const x = (ms: number) => L + ((Math.max(lo, Math.min(hi, ms)) - lo) / (hi - lo)) * (W - L - R);
  const rp0 = x(-550), mv = x(0), w = x(-206);
  const ramp = `M ${x(-1000)} ${ay - 6} L ${rp0} ${ay - 6} C ${rp0 + 60} ${ay - 8}, ${mv - 30} ${ay - 20}, ${mv} ${ay - 46}`;
  return (
    <View onLayout={onLayout}>
      <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
        <Line x1={L} x2={W - R} y1={ay} y2={ay} stroke={c.ink} strokeWidth={1.5} />
        {[-1000, -800, -600, -400, -200, 0, 200].map((m) => (
          <G key={m}>
            <Line x1={x(m)} x2={x(m)} y1={ay} y2={ay + 5} stroke={c.muted} />
            <SvgText x={x(m)} y={ay + 18} textAnchor="middle" fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
              {String(m)}
            </SvgText>
          </G>
        ))}
        <SvgText x={W - R} y={ay + 34} textAnchor="end" fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
          ms relative to the tap
        </SvgText>
        <Path d={`${ramp} L ${mv} ${ay - 6} Z`} fill={c.machine} opacity={0.15} />
        <Path d={ramp} fill="none" stroke={c.machine} strokeWidth={2} />
        <Line x1={rp0} x2={rp0} y1={ay - 60} y2={ay} stroke={c.machine} strokeDasharray="3 3" />
        <SvgText x={rp0 - 4} y={ay - 64} textAnchor="end" fontSize={11} fontFamily={fonts.mono} fill={c.machine}>
          brain starts −550
        </SvgText>
        <Line x1={w} x2={w} y1={ay - 40} y2={ay} stroke={c.muted} strokeWidth={2} />
        <SvgText x={w} y={ay - 44} textAnchor="middle" fontSize={11} fontFamily={fonts.mono} fill={c.muted}>
          Libet’s urge −206
        </SvgText>
        <Line x1={mv} x2={mv} y1={ay - 80} y2={ay} stroke={c.ink} strokeWidth={2} />
        <SvgText x={mv + 4} y={ay - 70} fontSize={11} fontFamily={fonts.mono} fontWeight="600" fill={c.ink}>
          tap
        </SvgText>
        {mine != null ? (
          <>
            <Circle cx={x(mine)} cy={ay} r={7} fill={c.you} stroke={c.surface} strokeWidth={2} />
            <SvgText
              x={Math.min(W - R - 44, Math.max(L + 44, x(mine)))}
              y={ay + 56}
              textAnchor="middle"
              fontSize={12} fontFamily={fonts.mono}
              fontWeight="600"
              fill={c.you}
            >
              {`you: ${fmt(mine)}`}
            </SvgText>
          </>
        ) : (
          <SvgText x={W / 2} y={ay + 56} textAnchor="middle" fontSize={12} fontFamily={fonts.mono} fill={c.muted}>
            Your average appears here after a trial
          </SvgText>
        )}
      </Svg>
    </View>
  );
}
