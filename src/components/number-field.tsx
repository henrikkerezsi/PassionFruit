import React, { useEffect, useRef, useState } from 'react';
import { HelperText, TextInput as PaperTextInput } from 'react-native-paper';

interface NumberFieldProps {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  unit?: string;
  autoFocus?: boolean;
  error?: string | null;
  helperText?: string | null;
  integer?: boolean;
}

export function parseNumber(text: string): number | null {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number | null): string {
  return value === null ? '' : String(value);
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  autoFocus,
  error,
  helperText,
  integer = false,
}: NumberFieldProps) {
  const [text, setText] = useState(() => formatNumber(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setText(formatNumber(value));
    }
  }, [value]);

  const handleChange = (next: string) => {
    setText(next);
    const parsed = parseNumber(next);
    const rounded =
      parsed !== null && integer ? Math.round(parsed) : parsed;
    lastEmitted.current = rounded;
    onChange(rounded);
  };

  return (
    <>
      <PaperTextInput
        label={label}
        mode="outlined"
        value={text}
        onChangeText={handleChange}
        keyboardType={integer ? 'number-pad' : 'decimal-pad'}
        autoFocus={autoFocus}
        error={Boolean(error)}
        right={unit ? <PaperTextInput.Affix text={unit} /> : undefined}
      />
      {error ? (
        <HelperText type="error">{error}</HelperText>
      ) : helperText ? (
        <HelperText type="info">{helperText}</HelperText>
      ) : null}
    </>
  );
}
