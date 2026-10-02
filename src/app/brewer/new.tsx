import React, { useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LoadingScreen } from '../../components/loading-screen';
import { BrewerForm } from '../../components/brewer-form';
import { useAppData } from '../../data/DataProvider';
import type { BrewerKind } from '../../models';

export default function NewBrewerScreen() {
  const router = useRouter();
  const { id, kind } = useLocalSearchParams<{ id?: string; kind?: string }>();
  const { ready, brewers, addBrewer, saveBrewer } = useAppData();
  const [submitting, setSubmitting] = useState(false);

  const brewerId = id ? Number(id) : null;
  const existing =
    brewerId === null ? null : brewers.find((brewer) => brewer.id === brewerId) ?? null;

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit equipment' : 'New equipment' }} />
      <BrewerForm
        initial={existing}
        defaultKind={(kind as BrewerKind | undefined) ?? 'dripper'}
        submitting={submitting}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            if (existing) {
              await saveBrewer(existing.id, input);
            } else {
              await addBrewer(input);
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
