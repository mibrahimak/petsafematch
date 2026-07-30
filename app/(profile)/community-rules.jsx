import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { COMMUNITY_RULES } from '../../constants/helpContent';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ProfileSection from '../../components/profile/ProfileSection';
import HelpScreenHeader from '../../components/help/HelpScreenHeader';

export default function CommunityRules() {
  const { colors } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <HelpScreenHeader title='Topluluk Kuralları' />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.description, { color: colors.label }]}>
          Sahiplendirme ve eşleştirmede güvenli ve sorumlu bir ortam için
          uyulması gereken temel kurallar.
        </ThemedText>

        <View style={styles.sections}>
          {COMMUNITY_RULES.map((rule) => (
            <ProfileSection key={rule.id} title={rule.title}>
              <View style={styles.ruleContent}>
                <ThemedText style={[styles.ruleText, { color: colors.label }]}>
                  {rule.content}
                </ThemedText>
              </View>
            </ProfileSection>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sections: {
    paddingHorizontal: 16,
  },
  ruleContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
