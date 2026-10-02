import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Switch, TextInput, Text } from 'react-native-paper';
import type { Roaster } from '../models';
import type { RoasterInput } from '../database/roasters';
import { useAppTheme } from '../theme';
import { KeyboardAwareScrollView } from './keyboard-aware-scroll-view';

interface RoasterFormProps {
  initial: Roaster | null;
  submitting: boolean;
  onSubmit: (input: RoasterInput) => Promise<void>;
}

export function RoasterForm({ initial, submitting, onSubmit }: RoasterFormProps) {
  const theme = useAppTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (name.trim() === '') {
      setError('Give the roaster a name.');
      return;
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      location: location.trim() === '' ? null : location.trim(),
      url: url.trim() === '' ? null : url.trim(),
      notes: notes.trim() === '' ? null : notes.trim(),
      active,
      sortOrder: initial?.sortOrder ?? 0,
    });
  };

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
    >
      <TextInput
        label="Name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        error={Boolean(error)}
        autoFocus={initial === null}
      />
      <TextInput
        label="Location"
        mode="outlined"
        value={location}
        onChangeText={setLocation}
        style={styles.field}
      />
      <TextInput
        label="Website"
        mode="outlined"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        keyboardType="url"
        style={styles.field}
      />
      <TextInput
        label="Notes"
        mode="outlined"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={styles.field}
      />
      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Active</Text>
        <Switch value={active} onValueChange={setActive} />
      </View>
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
        {initial ? 'Save roaster' : 'Add roaster'}
      </Button>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
