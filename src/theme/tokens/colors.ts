export interface SurfaceColors {
  readonly background: string;
  readonly surface: string;
  readonly surfaceSecondary: string;
  readonly surfaceTertiary: string;
  readonly surfaceHover: string;
  readonly surfacePressed: string;
  readonly elevation1: string;
  readonly elevation2: string;
  readonly elevation3: string;
  readonly elevation4: string;
  readonly elevation5: string;
}

export interface BorderColors {
  readonly border: string;
  readonly borderStrong: string;
  readonly borderSubtle: string;
}

export interface TextColors {
  readonly primary: string;
  readonly secondary: string;
  readonly tertiary: string;
  readonly disabled: string;
  readonly onAccent: string;
}

export interface BrandScale {
  readonly base: string;
  readonly hover: string;
  readonly pressed: string;
  readonly light: string;
  readonly muted: string;
}

export interface SemanticTokens {
  readonly success: string;
  readonly successLight: string;
  readonly successBorder: string;
  readonly warning: string;
  readonly warningLight: string;
  readonly warningBorder: string;
  readonly error: string;
  readonly errorLight: string;
  readonly errorBorder: string;
  readonly onErrorContainer: string;
  readonly info: string;
  readonly infoLight: string;
  readonly infoBorder: string;
}

export interface ColorTokens {
  readonly surfaces: SurfaceColors;
  readonly borders: BorderColors;
  readonly text: TextColors;
  readonly primary: BrandScale;
  readonly secondary: BrandScale;
  readonly water: BrandScale;
  readonly warm: BrandScale;
  readonly semantic: SemanticTokens;
}

export const lightColors: ColorTokens = {
  surfaces: {
    background: '#FDF7F2',
    surface: '#FFFCFA',
    surfaceSecondary: '#F7EFE8',
    surfaceTertiary: '#EFE3D8',
    surfaceHover: '#FAF2EB',
    surfacePressed: '#EADCD0',
    elevation1: '#FCF6F1',
    elevation2: '#FAF2EB',
    elevation3: '#F7EDE4',
    elevation4: '#F4E8DE',
    elevation5: '#F1E3D8',
  },
  borders: {
    border: '#E7D8C9',
    borderStrong: '#D2BCA7',
    borderSubtle: '#F0E5DA',
  },
  text: {
    primary: '#2B2018',
    secondary: '#665348',
    tertiary: '#826C5F',
    disabled: '#AFA093',
    onAccent: '#FFFCFA',
  },
  primary: {
    base: '#B0501D',
    hover: '#9B461A',
    pressed: '#863D16',
    light: '#F4E4DB',
    muted: '#E4C2AF',
  },
  secondary: {
    base: '#A62F6B',
    hover: '#92295E',
    pressed: '#7E2451',
    light: '#F3DFE6',
    muted: '#E1B6C9',
  },
  water: {
    base: '#2C766C',
    hover: '#27685F',
    pressed: '#215A52',
    light: '#E1E9E6',
    muted: '#B7CECA',
  },
  warm: {
    base: '#8A631F',
    hover: '#79551B',
    pressed: '#694819',
    light: '#EFE7DC',
    muted: '#D9C9B1',
  },
  semantic: {
    success: '#4C7A52',
    successLight: '#EAECE6',
    successBorder: '#C6D2C3',
    warning: '#96631A',
    warningLight: '#F2EADF',
    warningBorder: '#DFCDA8',
    error: '#B33F45',
    errorLight: '#F6E5E4',
    errorBorder: '#E7C0BE',
    onErrorContainer: '#6E2026',
    info: '#3F6E86',
    infoLight: '#E8EBEC',
    infoBorder: '#C0CFD5',
  },
};

export const darkColors: ColorTokens = {
  surfaces: {
    background: '#191310',
    surface: '#221B17',
    surfaceSecondary: '#2A221C',
    surfaceTertiary: '#342A23',
    surfaceHover: '#2E251F',
    surfacePressed: '#392F27',
    elevation1: '#241D18',
    elevation2: '#27201A',
    elevation3: '#2B231C',
    elevation4: '#2F271F',
    elevation5: '#332B22',
  },
  borders: {
    border: '#40352C',
    borderStrong: '#524538',
    borderSubtle: '#362C25',
  },
  text: {
    primary: '#F8F0E8',
    secondary: '#CABCB0',
    tertiary: '#9E8D7F',
    disabled: '#6E6258',
    onAccent: '#191310',
  },
  primary: {
    base: '#F0A175',
    hover: '#F2AC86',
    pressed: '#F0A378',
    light: '#402D22',
    muted: '#6B4936',
  },
  secondary: {
    base: '#E08BB4',
    hover: '#E499BD',
    pressed: '#E18DB6',
    light: '#3D292E',
    muted: '#65414E',
  },
  water: {
    base: '#7CC4BA',
    hover: '#8CCBC2',
    pressed: '#7FC5BB',
    light: '#2B332F',
    muted: '#3F5651',
  },
  warm: {
    base: '#E5B45C',
    hover: '#E8BD70',
    pressed: '#E6B65F',
    light: '#3E301E',
    muted: '#67502D',
  },
  semantic: {
    success: '#7DBE86',
    successLight: '#282D22',
    successBorder: '#40523E',
    warning: '#DFAE5E',
    warningLight: '#372A1C',
    warningBorder: '#65502E',
    error: '#E2817D',
    errorLight: '#372420',
    errorBorder: '#6A3D38',
    onErrorContainer: '#F6BDB8',
    info: '#8BBEDA',
    infoLight: '#2A2D2E',
    infoBorder: '#3F5866',
  },
};
