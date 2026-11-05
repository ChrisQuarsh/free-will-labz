import { useColorScheme } from 'react-native';

// Two characters run through every screen: YOU (indigo) and THE MACHINE / THE BRAIN (vermilion).
export const palettes = {
  light: {
    paper: '#ECEDF3',
    surface: '#F9F9FC',
    ink: '#17172B',
    muted: '#5B5C73',
    line: '#D2D3E0',
    you: '#3B33D1',
    youSoft: '#E1E0FA',
    onYou: '#FFFFFF',
    machine: '#C93A2A',
    machineSoft: '#F8DFDA',
  },
  dark: {
    paper: '#11111B',
    surface: '#1A1A28',
    ink: '#E8E8F2',
    muted: '#9A9BB3',
    line: '#2D2E42',
    you: '#8F89FF',
    youSoft: '#25234E',
    onYou: '#11111B',
    machine: '#FF7B67',
    machineSoft: '#43221E',
  },
};

export type Palette = typeof palettes.light;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? palettes.dark : palettes.light;
}

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  displayBold: 'BricolageGrotesque_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_600SemiBold',
};
