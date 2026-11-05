import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, Header, Label, Screen, T } from '../components/ui';
import { EVIDENCE, IN_SHORT } from '../data/evidence';
import { haptic } from '../lib/haptics';
import { fonts, useTheme } from '../theme';

type Filter = 'all' | 'brain' | 'phil';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'brain', label: 'Neuroscience' },
  { key: 'phil', label: 'Philosophy' },
];

export default function EvidenceScreen() {
  const c = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const items = EVIDENCE.filter((e) => filter === 'all' || e.kind === filter);

  return (
    <Screen>
      <Header eyebrow="The Evidence" title="What we actually know.">
        The key arguments and experiments, in the order they were published. Each comes with the reason it didn’t settle
        the question.
      </Header>

      <Card>
        {IN_SHORT.map((s, i) => (
          <View key={s.label} style={{ gap: 4, paddingTop: i ? 14 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: c.line }}>
            <Label color={c.you}>{s.label}</Label>
            <T small>{s.text}</T>
          </View>
        ))}
      </Card>

      <View style={{ flexDirection: 'row', backgroundColor: c.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: c.line }}>
        {FILTERS.map((f) => {
          const on = f.key === filter;
          return (
            <Pressable
              key={f.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => {
                setFilter(f.key);
                haptic.tick();
              }}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 9, backgroundColor: on ? c.ink : 'transparent', alignItems: 'center' }}
            >
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 14, color: on ? c.paper : c.muted }}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {items.map((e) => {
        const brain = e.kind === 'brain';
        return (
          <Card key={e.year + e.title} style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 28, color: c.ink }}>{e.year}</Text>
              <View style={{ backgroundColor: brain ? c.machineSoft : c.youSoft, borderRadius: 99, paddingHorizontal: 9, paddingVertical: 3 }}>
                <Label color={brain ? c.machine : c.you} style={{ fontSize: 10 }}>
                  {brain ? 'Neuroscience' : 'Philosophy'}
                </Label>
              </View>
            </View>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 19, lineHeight: 23, color: c.ink }}>{e.title}</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: c.muted }}>{e.who}</Text>
            <T small>{e.says}</T>
            <View style={{ borderLeftWidth: 2, borderLeftColor: c.line, paddingLeft: 12, gap: 3 }}>
              <Label>The catch</Label>
              <T small muted>{e.catch}</T>
            </View>
          </Card>
        );
      })}

      <T small muted>
        Sources: Libet et al., Brain 1983; Soon et al., Nature Neuroscience 2008; Fried et al., Neuron 2011; Schurger et
        al., PNAS 2012; Schultze-Kraft et al., PNAS 2016; Maoz et al., eLife 2019; Bourget & Chalmers, PhilPapers Survey
        2020; Aaronson, Quantum Computing Since Democritus, 2013. Figures are rounded.
      </T>
    </Screen>
  );
}
