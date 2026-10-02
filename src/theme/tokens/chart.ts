export const chartPaletteLight: readonly string[] = [
  '#C0392B',
  '#B06500',
  '#6F7A00',
  '#2F7D28',
  '#0F7B6E',
  '#2A5CC4',
  '#8439A8',
  '#B3126A',
];

export const chartPaletteDark: readonly string[] = [
  '#FF7A66',
  '#F0A33C',
  '#C6CE3A',
  '#5FC94F',
  '#35CFC0',
  '#6FA0FF',
  '#C17BF0',
  '#F06CB0',
];

export type ChartColor =
  | (typeof chartPaletteLight)[number]
  | (typeof chartPaletteDark)[number];
