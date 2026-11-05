import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';

import { Button, Card, H3, Header, Label, Screen, T, useWidth } from '../components/ui';
import { haptic } from '../lib/haptics';
import { coinTrial, Oracle, verdict, type Choice, type Press } from '../lib/oracle';
import { usePersistentState } from '../lib/storage';
import { fonts, useTheme } from '../theme';

export default function OracleScreen() {
  const c = useTheme();
  const [presses, setPresses] = usePersistentState<Press[]>('oracle.presses', []);
  const [last, setLast] = useState<{ guess: Choice; k: Choice } | null>(null);
  const [coin, setCoin] = useState<number | null>(null);
  const oracle = useRef(new Oracle());

  function press(k: Choice) {
    // Rebuild the model if saved presses were loaded from the device.
    if (oracle.current.history.length !== presses.length) {
      oracle.current = Oracle.fromHistory(presses.map((p) => p.k));
    }
    const guess = oracle.current.predict(); // made before the model sees k
    const hit = guess === k;
    oracle.current.learn(k);
    setPresses((prev) => [...prev, { k, hit }]);
    setLast({ guess, k });
    if (hit) haptic.thud();
    else haptic.tap();
  }

  function reset() {
    const go = () => {
      oracle.current = new Oracle();
      setPresses([]);
      setLast(null);
    };
    if (Platform.OS === 'web' || presses.length === 0) return go();
    Alert.alert('Start over?', `This clears your ${presses.length} presses.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start over', style: 'destructive', onPress: go },
    ]);
  }

  const n = presses.length;
  const hits = presses.filter((p) => p.hit).length;
  const recent = presses.slice(-20);
  const v = verdict(presses);

  return (
    <Screen>
      <Header eyebrow="Experiment 1 · The Oracle" title="Try to be unpredictable.">
        Tap Left or Right as randomly as you can. Before each tap, the machine has already guessed. If your choices had no
        pattern it would be right half the time. Most people are predicted 60–70% of the time.
      </Header>

      <Card>
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontFamily: fonts.mono, fontSize: 13, color: c.muted, minHeight: 18 }}
        >
          {last == null ? (
            'The machine has made its first guess. Your move.'
          ) : last.guess === last.k ? (
            <>
              <Text style={{ color: c.machine, fontFamily: fonts.monoBold }}>Predicted.</Text> It guessed {name(last.guess)} before you tapped.
            </>
          ) : (
            <>
              <Text style={{ color: c.you, fontFamily: fonts.monoBold }}>Escaped.</Text> It guessed {name(last.guess)}, you tapped {name(last.k)}.
            </>
          )}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Key label="Left" glyph="◀" onPress={() => press('L')} />
          <Key label="Right" glyph="▶" onPress={() => press('R')} />
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Stat label="Taps" value={String(n)} />
          <Stat label="Predicted" value={n ? `${Math.round((hits / n) * 100)}%` : '–'} color={c.machine} />
          <Stat
            label="Last 20"
            value={recent.length >= 5 ? `${Math.round((recent.filter((p) => p.hit).length / recent.length) * 100)}%` : '–'}
          />
        </View>
      </Card>

      <Card>
        <Label>
          Your last taps · <Text style={{ color: c.machine }}>red = predicted</Text> · <Text style={{ color: c.you }}>indigo = escaped</Text>
        </Label>
        {n === 0 ? (
          <T muted small>Nothing yet. Aim for 100 taps.</T>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 }}>
            {presses.slice(-60).map((p, i) => (
              <View
                key={n - 60 + i}
                style={{
                  width: 18,
                  height: 22,
                  borderRadius: 4,
                  backgroundColor: p.hit ? c.machineSoft : c.youSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: fonts.monoBold, fontSize: 10, color: p.hit ? c.machine : c.you }}>{p.k}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <H3>Machine accuracy over time</H3>
        <AccuracyChart presses={presses} />
        <View style={{ borderLeftWidth: 3, borderLeftColor: c.machine, paddingLeft: 12, gap: 4 }}>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 19, color: c.ink }}>{v.title}</Text>
          <T muted small>{v.body}</T>
        </View>
      </Card>

      <Card>
        <H3>Is a coin any better?</H3>
        <T muted small>
          A coin flip has no pattern to learn. Let one play 200 rounds against the same machine to see what truly
          unpredictable scores.
        </T>
        {coin != null && (
          <T small bold>
            A coin, 200 flips: the machine was right {Math.round(coin * 100)}% of the time.
          </T>
        )}
        <Button
          title={coin == null ? 'Let a coin play 200 rounds' : 'Run the coin again'}
          onPress={() => {
            setCoin(coinTrial(200));
            haptic.tap();
          }}
        />
      </Card>

      <Card>
        <H3>How it works</H3>
        <T muted small>
          The machine keeps a table of every sequence of up to five taps you’ve made and what you tapped next. To guess,
          it looks up your last five taps and picks whatever usually followed. People avoid long runs, alternate too
          often, and fall into rhythms without noticing. It’s based on a program the computer scientist Scott Aaronson
          wrote as a student.
        </T>
        <Button title="Start over" onPress={reset} disabled={n === 0} />
      </Card>
    </Screen>
  );
}

function name(k: Choice) {
  return k === 'L' ? 'Left' : 'Right';
}

function Key({ label, glyph, onPress }: { label: string; glyph: string; onPress: () => void }) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tap ${label}`}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        height: 128,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: c.ink,
        backgroundColor: pressed ? c.youSoft : c.surface,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transform: [{ translateY: pressed ? 3 : 0 }],
        boxShadow: pressed ? `0 1px 0 ${c.ink}` : `0 4px 0 ${c.ink}`,
      })}
    >
      <Text style={{ fontSize: 30, color: c.ink }}>{glyph}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 24, color: c.ink }}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  const c = useTheme();
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Label color={color}>{label}</Label>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ fontFamily: fonts.display, fontSize: 30, color: color ?? c.ink, fontVariant: ['tabular-nums'] }}
      >
        {value}
      </Text>
    </View>
  );
}

function AccuracyChart({ presses }: { presses: Press[] }) {
  const c = useTheme();
  const { width, onLayout } = useWidth();
  const W = 400, H = 220, L = 34, R = 10, Tp = 12, B = 26;
  const pw = W - L - R, ph = H - Tp - B;
  const n = presses.length, maxX = Math.max(100, n);
  const x = (i: number) => L + (i / maxX) * pw;
  const y = (p: number) => Tp + ph - (p / 100) * ph;

  let pts: [number, number][] = [];
  let h = 0;
  presses.forEach((p, i) => {
    h += p.hit ? 1 : 0;
    pts.push([x(i + 1), y((h / (i + 1)) * 100)]);
  });
  const line = pts.map((p) => p.join(',')).join(' ');
  const end = pts[pts.length - 1];

  return (
    <View onLayout={onLayout}>
      <Svg width={width} height={(width * H) / W} viewBox={`0 0 ${W} ${H}`}>
        {[0, 25, 75, 100].map((p) => (
          <Line key={p} x1={L} x2={W - R} y1={y(p)} y2={y(p)} stroke={c.line} strokeWidth={1} />
        ))}
        {[0, 25, 50, 75, 100].map((p) => (
          <SvgText key={`t${p}`} x={L - 6} y={y(p) + 4} textAnchor="end" fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
            {`${p}%`}
          </SvgText>
        ))}
        <Line x1={L} x2={W - R} y1={y(50)} y2={y(50)} stroke={c.you} strokeDasharray="4 4" strokeWidth={1.5} />
        <SvgText x={W - R} y={y(50) - 6} textAnchor="end" fontSize={10} fontFamily={fonts.mono} fill={c.you}>
          chance = 50%
        </SvgText>
        <SvgText x={L} y={H - 6} fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
          0
        </SvgText>
        <SvgText x={W - R} y={H - 6} textAnchor="end" fontSize={10} fontFamily={fonts.mono} fill={c.muted}>
          {`${maxX} taps`}
        </SvgText>
        {n >= 2 && end ? (
          <>
            <Polygon points={`${x(1)},${y(0)} ${line} ${end[0]},${y(0)}`} fill={c.machine} opacity={0.1} />
            <Polyline points={line} fill="none" stroke={c.machine} strokeWidth={2} strokeLinejoin="round" />
            <Circle cx={end[0]} cy={end[1]} r={4.5} fill={c.machine} stroke={c.surface} strokeWidth={2} />
          </>
        ) : (
          <SvgText x={L + pw / 2} y={y(75)} textAnchor="middle" fontSize={12} fontFamily={fonts.mono} fill={c.muted}>
            The line appears after your first taps
          </SvgText>
        )}
      </Svg>
    </View>
  );
}
