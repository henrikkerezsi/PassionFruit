import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Divider, Switch, Text, TextInput } from 'react-native-paper';
import type { Bean, BeanProcess, RoastLevel } from '../models';
import { BEAN_PROCESSES, ROAST_LEVELS } from '../models';
import type { BeanInput } from '../database/beans';
import { useAppData } from '../data/DataProvider';
import { useAppTheme } from '../theme';
import { PROCESS_LABELS, ROAST_LEVEL_LABELS } from '../utils/labels';
import { isIsoDate } from '../utils/date';
import { KeyboardAwareScrollView } from './keyboard-aware-scroll-view';
import { DateField } from './date-field';
import { NumberField } from './number-field';
import { OptionField } from './option-field';

interface BeanFormProps {
  initial: Bean | null;
  submitting: boolean;
  onSubmit: (input: BeanInput) => Promise<void>;
}

const PROCESS_OPTIONS = BEAN_PROCESSES.map((value) => ({
  value,
  label: PROCESS_LABELS[value],
}));
const ROAST_OPTIONS = ROAST_LEVELS.map((value) => ({
  value,
  label: ROAST_LEVEL_LABELS[value],
}));

export function BeanForm({ initial, submitting, onSubmit }: BeanFormProps) {
  const theme = useAppTheme();
  const { roasters } = useAppData();

  const [name, setName] = useState(initial?.name ?? '');
  const [roasterId, setRoasterId] = useState<number | null>(initial?.roasterId ?? null);
  const [originCountry, setOriginCountry] = useState(initial?.originCountry ?? '');
  const [originRegion, setOriginRegion] = useState(initial?.originRegion ?? '');
  const [farm, setFarm] = useState(initial?.farm ?? '');
  const [producer, setProducer] = useState(initial?.producer ?? '');
  const [varietal, setVarietal] = useState(initial?.varietal ?? '');
  const [process, setProcess] = useState<BeanProcess | null>(initial?.process ?? null);
  const [altitudeM, setAltitudeM] = useState<number | null>(initial?.altitudeM ?? null);
  const [roastLevel, setRoastLevel] = useState<RoastLevel | null>(
    initial?.roastLevel ?? null
  );
  const [roastDate, setRoastDate] = useState<string | null>(initial?.roastDate ?? null);
  const [purchasedDate, setPurchasedDate] = useState<string | null>(
    initial?.purchasedDate ?? null
  );
  const [openedDate, setOpenedDate] = useState<string | null>(initial?.openedDate ?? null);
  const [finishedDate, setFinishedDate] = useState<string | null>(
    initial?.finishedDate ?? null
  );
  const [bagWeightG, setBagWeightG] = useState<number | null>(initial?.bagWeightG ?? null);
  const [remainingWeightG, setRemainingWeightG] = useState<number | null>(
    initial?.remainingWeightG ?? null
  );
  const [price, setPrice] = useState<number | null>(
    initial?.priceCents != null ? initial.priceCents / 100 : null
  );
  const [currency, setCurrency] = useState(initial?.currency ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (name.trim() === '') {
      setError('Give the bean a name.');
      return;
    }
    const dates: [string, string | null][] = [
      ['Roast date', roastDate],
      ['Purchased date', purchasedDate],
      ['Opened date', openedDate],
      ['Finished date', finishedDate],
    ];
    for (const [label, value] of dates) {
      if (value !== null && !isIsoDate(value)) {
        setError(`${label} must look like YYYY-MM-DD.`);
        return;
      }
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      roasterId,
      originCountry: emptyToNull(originCountry),
      originRegion: emptyToNull(originRegion),
      farm: emptyToNull(farm),
      producer: emptyToNull(producer),
      varietal: emptyToNull(varietal),
      process,
      altitudeM,
      roastLevel,
      roastDate,
      purchasedDate,
      openedDate,
      finishedDate,
      bagWeightG,
      remainingWeightG,
      priceCents: price === null ? null : Math.round(price * 100),
      currency: emptyToNull(currency),
      notes: emptyToNull(notes),
      isActive,
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
      <View style={styles.field}>
        <OptionField<number>
          label="Roaster"
          value={roasterId}
          options={roasters.map((roaster) => ({ value: roaster.id, label: roaster.name }))}
          onChange={setRoasterId}
          emptyLabel="Not set"
        />
      </View>
      <View style={styles.field}>
        <OptionField<BeanProcess>
          label="Process"
          value={process}
          options={PROCESS_OPTIONS}
          onChange={setProcess}
          nullable
        />
      </View>
      <View style={styles.field}>
        <OptionField<RoastLevel>
          label="Roast level"
          value={roastLevel}
          options={ROAST_OPTIONS}
          onChange={setRoastLevel}
          nullable
        />
      </View>

      <Divider style={styles.divider} />
      <Text variant="titleSmall" style={styles.groupTitle}>
        Origin
      </Text>
      <TextInput
        label="Country"
        mode="outlined"
        value={originCountry}
        onChangeText={setOriginCountry}
      />
      <TextInput
        label="Region"
        mode="outlined"
        value={originRegion}
        onChangeText={setOriginRegion}
        style={styles.field}
      />
      <TextInput
        label="Farm"
        mode="outlined"
        value={farm}
        onChangeText={setFarm}
        style={styles.field}
      />
      <TextInput
        label="Producer"
        mode="outlined"
        value={producer}
        onChangeText={setProducer}
        style={styles.field}
      />
      <TextInput
        label="Varietal"
        mode="outlined"
        value={varietal}
        onChangeText={setVarietal}
        style={styles.field}
      />
      <View style={styles.field}>
        <NumberField label="Altitude" value={altitudeM} onChange={setAltitudeM} unit="m" integer />
      </View>

      <Divider style={styles.divider} />
      <Text variant="titleSmall" style={styles.groupTitle}>
        Weight and dates
      </Text>
      <NumberField label="Bag weight" value={bagWeightG} onChange={setBagWeightG} unit="g" />
      <View style={styles.field}>
        <NumberField
          label="Remaining"
          value={remainingWeightG}
          onChange={setRemainingWeightG}
          unit="g"
        />
      </View>
      <View style={styles.field}>
        <DateField label="Roast date" value={roastDate} onChange={setRoastDate} />
      </View>
      <View style={styles.field}>
        <DateField label="Purchased" value={purchasedDate} onChange={setPurchasedDate} />
      </View>
      <View style={styles.field}>
        <DateField label="Opened" value={openedDate} onChange={setOpenedDate} />
      </View>
      <View style={styles.field}>
        <DateField label="Finished" value={finishedDate} onChange={setFinishedDate} />
      </View>

      <Divider style={styles.divider} />
      <Text variant="titleSmall" style={styles.groupTitle}>
        Price
      </Text>
      <NumberField label="Price" value={price} onChange={setPrice} />
      <TextInput
        label="Currency"
        mode="outlined"
        value={currency}
        onChangeText={setCurrency}
        autoCapitalize="characters"
        style={styles.field}
      />

      <Divider style={styles.divider} />
      <TextInput
        label="Notes"
        mode="outlined"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />
      <View style={styles.switchRow}>
        <Text variant="bodyLarge">Active</Text>
        <Switch value={isActive} onValueChange={setIsActive} />
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
        {initial ? 'Save bean' : 'Add bean'}
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
    paddingBottom: 32,
  },
  field: {
    marginTop: 12,
  },
  divider: {
    marginVertical: 16,
  },
  groupTitle: {
    marginBottom: 10,
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
