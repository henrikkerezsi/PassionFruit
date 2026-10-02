import React, { useState } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { LoadingScreen } from '../../components/loading-screen';
import { BeanForm } from '../../components/bean-form';
import { useAppData } from '../../data/DataProvider';

export default function NewBeanScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { ready, beans, addBean, saveBean } = useAppData();
  const [submitting, setSubmitting] = useState(false);

  const beanId = id ? Number(id) : null;
  const existing = beanId === null ? null : beans.find((bean) => bean.id === beanId) ?? null;

  if (!ready) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen options={{ title: existing ? 'Edit bean' : 'New bean' }} />
      <BeanForm
        initial={existing}
        submitting={submitting}
        onSubmit={async (input) => {
          setSubmitting(true);
          try {
            if (existing) {
              await saveBean(existing.id, input);
            } else {
              await addBean(input);
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
