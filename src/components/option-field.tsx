import React, { useState } from 'react';
import { View } from 'react-native';
import { HelperText, Menu, TextInput as PaperTextInput } from 'react-native-paper';

export interface Option<T extends string | number> {
  value: T;
  label: string;
}

interface OptionFieldProps<T extends string | number> {
  label: string;
  value: T | null;
  options: readonly Option<T>[];
  onChange: (value: T | null) => void;
  nullable?: boolean;
  emptyLabel?: string;
  error?: string | null;
}

export function OptionField<T extends string | number>({
  label,
  value,
  options,
  onChange,
  nullable = true,
  emptyLabel = 'Not set',
  error,
}: OptionFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const display = selected ? selected.label : emptyLabel;

  return (
    <View>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        anchor={
          <PaperTextInput
            label={label}
            mode="outlined"
            value={display}
            editable={false}
            error={Boolean(error)}
            onPressIn={() => setOpen(true)}
            right={<PaperTextInput.Icon icon="menu-down" onPress={() => setOpen(true)} />}
          />
        }
      >
        {nullable ? (
          <Menu.Item
            title={emptyLabel}
            onPress={() => {
              onChange(null);
              setOpen(false);
            }}
          />
        ) : null}
        {options.map((option) => (
          <Menu.Item
            key={option.value}
            title={option.label}
            leadingIcon={option.value === value ? 'check' : undefined}
            onPress={() => {
              onChange(option.value);
              setOpen(false);
            }}
          />
        ))}
      </Menu>
      {error ? <HelperText type="error">{error}</HelperText> : null}
    </View>
  );
}
