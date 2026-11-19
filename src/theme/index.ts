import { useColorScheme } from 'react-native';

export interface Palette {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  onAccent: string;
  danger: string;
}

// Contrast checked: text/background ≥ 4.5:1 in both schemes.
const light: Palette = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  text: '#14181F',
  textMuted: '#5B6472',
  border: '#DDE1E7',
  accent: '#2F6FEB',
  onAccent: '#FFFFFF',
  danger: '#C62828',
};

const dark: Palette = {
  background: '#0E1116',
  surface: '#171B22',
  text: '#E8ECF2',
  textMuted: '#A0A9B8',
  border: '#2A303A',
  accent: '#6D9BFF',
  onAccent: '#0E1116',
  danger: '#FF7A7A',
};

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const MIN_TOUCH = 44;
