import React from 'react';
import { TextInput } from 'react-native-paper';
import { isIsoDate } from '../utils/date';

interface DateFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  autoFocus?: boolean;
}

export function DateField({ label, value, onChange, autoFocus }: DateFieldProps) {
  const invalid = value !== null && value !== '' && !isIsoDate(value);
  return (
    <TextInput
      label={label}
      mode="outlined"
      value={value ?? ''}
      placeholder="YYYY-MM-DD"
      autoCapitalize="none"
      onChangeText={(text) => onChange(text.trim() === '' ? null : text)}
      error={invalid}
      autoFocus={autoFocus}
      right={<TextInput.Icon icon="calendar" />}
    />
  );
}
