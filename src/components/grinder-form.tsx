import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Switch, Text, TextInput } from 'react-native-paper';
import type { Brewer, GrindSetting } from '../models';
import type { GrindSettingInput } from '../database/grinders';
import { useAppTheme } from '../theme';
import { BREWER_KIND_LABELS } from '../utils/labels';
import { KeyboardAwareScrollView } from './keyboard-aware-scroll-view';
import { NumberField } from './number-field';
import { OptionField } from './option-field';

interface GrinderFormProps {
  initial: GrindSetting | null;
  grinders: Brewer[];
  submitting: boolean;
  onSubmit: (input: GrindSettingInput) => Promise<void>;
}

export function GrinderForm({
  initial,
  grinders,
  submitting,
  onSubmit,
}: GrinderFormProps) {
  const theme = useAppTheme();
  const [brewerId, setBrewerId] = useState<number | null>(
    initial?.brewerId ?? grinders[0]?.id ?? null
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [selectionLabel, setSelectionLabel] = useState(initial?.selectionLabel ?? '');
  const [stepCount, setStepCount] = useState<number | null>(initial?.stepCount ?? null);
  const [isZeroBased, setIsZeroBased] = useState(initial?.isZeroBased ?? false);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  const options = grinders.map((grinder) => ({
    value: grinder.id,
    label: `${grinder.name} (${BREWER_KIND_LABELS[grinder.kind]})`,
  }));

  const handleSubmit = async () => {
    if (brewerId === null) {
      setError('Add a grinder under Equipment first.');
      return;
    }
    if (name.trim() === '') {
      setError('Give the setting a name.');
      return;
    }
    setError(null);
    await onSubmit({
      brewerId,
      name: name.trim(),
      selectionLabel: emptyToNull(selectionLabel),
      stepCount,
      isZeroBased,
      notes: emptyToNull(notes),
    });
  };

  if (grinders.length === 0) {
    return (
      <View style={[styles.empty, { padding: theme.spacing[6] }]}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No grinders yet. Add one under Equipment with the kind “Grinder”.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
    >
      <OptionField<number>
        label="Grinder"
        value={brewerId}
        options={options}
        onChange={setBrewerId}
        nullable={false}
        emptyLabel="Select a grinder"
      />
      <TextInput
        label="Setting name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        error={Boolean(error)}
        style={styles.field}
        autoFocus={initial === null}
      />
      <TextInput
        label="Selection label"
        mode="outlined"
        value={selectionLabel}
        onChangeText={setSelectionLabel}
        placeholder="e.g. 18 clicks, or 2.4"
        style={styles.field}
      />
      <View style={styles.field}>
        <NumberField label="Step count" value={stepCount} onChange={setStepCount} integer />
      </View>
      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Zero-based dial</Text>
        <Switch value={isZeroBased} onValueChange={setIsZeroBased} />
      </View>
      <TextInput
        label="Notes"
        mode="outlined"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.field}
      />
      {error ? (
        <Text variant="bodySmall" style={{ color: theme.semantic.error }}>
          {error}
        </Text>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={submitting}
        disabled={submitting}
        style={styles.submit}
      >
        {initial ? 'Save setting' : 'Add setting'}
      </Button>
    </KeyboardAwareScrollView>
  );
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
  },
  field: {
    marginTop: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  submit: {
    marginTop: 24,
  },
});
