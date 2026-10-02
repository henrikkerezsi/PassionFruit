import type { SemanticTokens } from './tokens/colors';

export interface SemanticColors {
  readonly success: string;
  readonly successContainer: string;
  readonly onSuccess: string;
  readonly successBorder: string;
  readonly warning: string;
  readonly warningContainer: string;
  readonly onWarning: string;
  readonly warningBorder: string;
  readonly error: string;
  readonly errorContainer: string;
  readonly onError: string;
  readonly errorBorder: string;
  readonly info: string;
  readonly infoContainer: string;
  readonly onInfo: string;
  readonly infoBorder: string;
  readonly sour: string;
  readonly sourContainer: string;
  readonly onSour: string;
  readonly sourBorder: string;
  readonly sweet: string;
  readonly sweetContainer: string;
  readonly onSweet: string;
  readonly sweetBorder: string;
  readonly delete: string;
  readonly deleteContainer: string;
}

export function buildSemanticColors(
  tokens: SemanticTokens,
  onAccent: string
): SemanticColors {
  return {
    success: tokens.success,
    successContainer: tokens.successLight,
    onSuccess: onAccent,
    successBorder: tokens.successBorder,
    warning: tokens.warning,
    warningContainer: tokens.warningLight,
    onWarning: onAccent,
    warningBorder: tokens.warningBorder,
    error: tokens.error,
    errorContainer: tokens.errorLight,
    onError: onAccent,
    errorBorder: tokens.errorBorder,
    info: tokens.info,
    infoContainer: tokens.infoLight,
    onInfo: onAccent,
    infoBorder: tokens.infoBorder,
    sour: tokens.error,
    sourContainer: tokens.errorLight,
    onSour: onAccent,
    sourBorder: tokens.errorBorder,
    sweet: tokens.success,
    sweetContainer: tokens.successLight,
    onSweet: onAccent,
    sweetBorder: tokens.successBorder,
    delete: tokens.error,
    deleteContainer: tokens.errorLight,
  };
}
