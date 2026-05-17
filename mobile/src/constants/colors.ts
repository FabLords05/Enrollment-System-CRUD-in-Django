/**
 * src/constants/colors.ts
 * Dual-exported to satisfy both uppercase and camelCase import statements safely.
 */

export const COLORS = {
  ustpDarkBlue: '#0A2540',
  ustpBlue: '#0052CC',
  ustpGold: '#FFB800',
  emerald: '#10B981',
  emeraldBg: '#ECFDF5',
  purple: '#8B5CF6',
  purpleBg: '#F5F3FF',
  red: '#EF4444',
  redBg: '#FEF2F2',
  blueBg: '#EFF6FF',
  grayBg: '#F3F4F6',
  border: '#E5E7EB',
  textMain: '#1F2937',
  textMuted: '#6B7280',
};

// Alias export to satisfy files searching for 'Colors' with lowercase letters
export const Colors = COLORS;
export default COLORS;