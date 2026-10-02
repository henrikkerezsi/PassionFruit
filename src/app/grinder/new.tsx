import React, { useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LoadingScreen } from '../../components/loading-screen';
import { GrinderForm } from '../../components/grinder-form';
import { useAppData } from '../../data/DataProvider';

export default function NewGrinderScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { ready, brewers, grindSettings, addGrindSetting, saveGrindSetting } = useAppData();
  const [submitting, setSubmitting] = useState(false);

  const settingId = id ? Number(id) : null;
  const existing =
    settingId === null
      ? null
      : grindSettings.find((setting) => setting.id === settingId) ?? null;
  const grinders = brewers.filter((brewer) => brewer.kind === 'grinder');

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit grind setting' : 'New grind setting' }} />
      <GrinderForm
        initial={existing}
        grinders={grinders}
        submitting={submitting}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            if (existing) {
              await saveGrindSetting(existing.id, input);
            } else {
              await addGrindSetting(input);
            }
            router.back();
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </>
  );
}
