import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Card, Chip, Divider, List, Searchbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenFade } from '../../components/screen-fade';
import { KeyboardAwareScrollView } from '../../components/keyboard-aware-scroll-view';
import { EmptyState } from '../../components/empty-state';
import { useAppData } from '../../data/DataProvider';
import { useAppTheme } from '../../theme';
import { BREW_METHOD_IDS } from '../../models';
import type { BrewMethodId, Recipe } from '../../models';
import { methodLabel } from '../../utils/labels';
import { deriveRatio, formatRatio } from '../../services/method-service';

export default function ExploreScreen() {
  const theme = useAppTheme();
  const { recipes, beans, methods } = useAppData();
  const [query, setQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<BrewMethodId | null>(null);

  const builtinRecipes = useMemo(
    () => recipes.filter((recipe) => recipe.isBuiltin),
    [recipes]
  );
  const ownRecipes = useMemo(
    () => recipes.filter((recipe) => !recipe.isBuiltin),
    [recipes]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...ownRecipes, ...builtinRecipes].filter((recipe) => {
      if (methodFilter !== null && recipe.methodId !== methodFilter) {
        return false;
      }
      if (needle === '') {
        return true;
      }
      return (
        recipe.name.toLowerCase().includes(needle) ||
        methodLabel(recipe.methodId).toLowerCase().includes(needle)
      );
    });
  }, [ownRecipes, builtinRecipes, methodFilter, query]);

  const activeBeans = beans.filter((bean) => bean.isActive && !bean.deleted);

  return (
    <ScreenFade>
      <KeyboardAwareScrollView
        contentContainerStyle={[styles.container, { padding: theme.spacing[4] }]}
      >
        <Card mode="contained" style={styles.helpCard}>
          <Card.Content>
            <View style={styles.helpHeader}>
              <MaterialCommunityIcons
                name="lifebuoy"
                size={22}
                color={theme.colors.primary}
              />
              <Text variant="titleMedium" style={styles.helpTitle}>
                Get help
              </Text>
            </View>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Bring a recipe or a cup that went wrong and ask for technique advice. Arrives in a
              later update; the built-in method notes already work offline.
            </Text>
          </Card.Content>
        </Card>

        <Searchbar
          placeholder="Search recipes"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          <Chip
            selected={methodFilter === null}
            onPress={() => setMethodFilter(null)}
            style={styles.chip}
          >
            All
          </Chip>
          {BREW_METHOD_IDS.map((methodId) => (
            <Chip
              key={methodId}
              selected={methodFilter === methodId}
              onPress={() =>
                setMethodFilter(methodFilter === methodId ? null : methodId)
              }
              style={styles.chip}
            >
              {methodLabel(methodId)}
            </Chip>
          ))}
        </ScrollView>

        <Text variant="titleMedium" style={styles.section}>
          Recipes
        </Text>
        {filtered.length === 0 ? (
          <EmptyState message="No recipes match this search yet." />
        ) : (
          filtered.map((recipe) => (
            <RecipeRow key={recipe.id} recipe={recipe} />
          ))
        )}

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.section}>
          Beans
        </Text>
        {activeBeans.length === 0 ? (
          <EmptyState
            icon={
              <MaterialCommunityIcons
                name="coffee-outline"
                size={48}
                color={theme.colors.onSurfaceVariant}
              />
            }
            message="No active beans yet. Add one to track freshness and weight."
            actionLabel="Add a bean"
            onAction={() => router.push('/bean/new')}
          />
        ) : (
          <>
            {activeBeans.map((bean) => (
              <List.Item
                key={bean.id}
                title={bean.name}
                description={bean.roastDate ? `Roasted ${bean.roastDate}` : 'No roast date'}
                left={(props) => <List.Icon {...props} icon="coffee-outline" />}
                onPress={() => router.push(`/bean/${bean.id}`)}
              />
            ))}
            <List.Item
              title="Add a bean"
              left={(props) => <List.Icon {...props} icon="plus" />}
              onPress={() => router.push('/bean/new')}
            />
          </>
        )}

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.section}>
          Methods
        </Text>
        {methods.map((method) => (
          <List.Item
            key={method.id}
            title={method.name}
            description={methodLabel(method.id)}
            left={(props) => <List.Icon {...props} icon="coffee-maker-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push(`/method/${method.id}`)}
          />
        ))}
      </KeyboardAwareScrollView>
    </ScreenFade>
  );
}

function RecipeRow({ recipe }: { recipe: Recipe }) {
  const ratio = formatRatio(deriveRatio(recipe.doseG, recipe.waterTotalG));
  const source = recipe.isBuiltin ? 'Built-in' : 'My recipe';
  return (
    <List.Item
      title={recipe.name}
      description={`${source} · ${methodLabel(recipe.methodId)} · ${ratio}`}
      left={(props) => (
        <List.Icon {...props} icon={recipe.isBuiltin ? 'book-open-variant' : 'bookmark-outline'} />
      )}
      onPress={() => router.push(`/recipe/${recipe.id}`)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  helpCard: {
    marginBottom: 16,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  helpTitle: {
    marginLeft: 8,
  },
  search: {
    marginBottom: 12,
  },
  chips: {
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    marginRight: 4,
  },
  section: {
    marginTop: 8,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
});
