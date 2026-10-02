import React, { useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LoadingScreen } from '../../components/loading-screen';
import { RoasterForm } from '../../components/roaster-form';
import { useAppData } from '../../data/DataProvider';

export default function NewRoasterScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { ready, roasters, addRoaster, saveRoaster } = useAppData();
  const [submitting, setSubmitting] = useState(false);

  const roasterId = id ? Number(id) : null;
  const existing =
    roasterId === null ? null : roasters.find((roaster) => roaster.id === roasterId) ?? null;

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit roaster' : 'New roaster' }} />
      <RoasterForm
        initial={existing}
        submitting={submitting}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            if (existing) {
              await saveRoaster(existing.id, input);
            } else {
              await addRoaster(input);
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
