import { BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { JetBrainsMono_400Regular, JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { NativeTabs } from 'expo-router/native-tabs';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { useTheme } from '../theme';

export default function RootLayout() {
  const c = useTheme();
  const [loaded, error] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(c.paper).catch(() => {});
  }, [c.paper]);

  // If fonts fail to load, carry on with system fonts rather than a blank screen.
  if (!loaded && !error) return null;

  return (
    <>
      <StatusBar style="auto" />
      <NativeTabs tintColor={c.you} backgroundColor={c.surface} indicatorColor={c.youSoft} labelVisibilityMode="labeled">
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Oracle</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'dice', selected: 'dice.fill' }} md="casino" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="libet">
          <NativeTabs.Trigger.Label>Libet Clock</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="timer" md="timer" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="stance">
          <NativeTabs.Trigger.Label>Your View</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf="scalemass" md="balance" />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="evidence">
          <NativeTabs.Trigger.Label>Evidence</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={{ default: 'book.closed', selected: 'book.closed.fill' }} md="menu_book" />
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  );
}
