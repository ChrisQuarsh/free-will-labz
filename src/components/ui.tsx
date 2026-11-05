import { useState, type ReactNode, type Ref } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type ScrollViewInstance,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, useTheme } from '../theme';

export function Screen({ children, ref }: { children: ReactNode; ref?: Ref<ScrollViewInstance> }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      ref={ref}
      style={{ flex: 1, backgroundColor: c.paper }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        paddingHorizontal: 18,
        // iOS adjusts for the status bar and tab bar itself; elsewhere pad manually.
        paddingTop: Platform.OS === 'ios' ? 8 : Platform.OS === 'web' ? 76 : insets.top + 16,
        paddingBottom: Platform.OS === 'ios' ? 32 : insets.bottom + 32,
        gap: 16,
        width: '100%',
        maxWidth: 640,
        alignSelf: 'center',
      }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Header({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  const c = useTheme();
  return (
    <View style={{ gap: 8, paddingBottom: 4 }}>
      <Label>{eyebrow}</Label>
      <Text accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 34, lineHeight: 36, color: c.ink, letterSpacing: -0.6 }}>
        {title}
      </Text>
      {children ? <T muted>{children}</T> : null}
    </View>
  );
}

export function Label({ children, color, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return (
    <Text style={[{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: color ?? c.muted }, style]}>
      {children}
    </Text>
  );
}

export function T({ children, muted, small, bold, style }: { children: ReactNode; muted?: boolean; small?: boolean; bold?: boolean; style?: StyleProp<TextStyle> }) {
  const c = useTheme();
  return (
    <Text
      style={[
        { fontSize: small ? 14 : 16, lineHeight: small ? 20 : 23, color: muted ? c.muted : c.ink, fontWeight: bold ? '600' : '400' },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function H3({ children, color }: { children: ReactNode; color?: string }) {
  const c = useTheme();
  return <Text style={{ fontFamily: fonts.displayBold, fontSize: 20, lineHeight: 24, color: color ?? c.ink }}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const c = useTheme();
  return (
    <View style={[{ backgroundColor: c.surface, borderColor: c.line, borderWidth: StyleSheet.hairlineWidth * 2, borderRadius: 18, padding: 18, gap: 14 }, style]}>
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'secondary',
  disabled,
  big,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  big?: boolean;
}) {
  const c = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: primary ? c.you : c.paper,
        borderColor: primary ? c.you : c.line,
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: big ? 18 : 12,
        paddingHorizontal: 18,
        alignItems: 'center',
        opacity: disabled ? 0.45 : pressed ? 0.75 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <Text style={{ fontFamily: fonts.displayBold, fontSize: big ? 19 : 16, color: primary ? c.onYou : c.ink }}>{title}</Text>
    </Pressable>
  );
}

/** Measures the width a child has to draw in, for sizing SVG charts. */
export function useWidth(initial = 320) {
  const [width, setWidth] = useState(initial);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== width) setWidth(w);
  };
  return { width, onLayout };
}
