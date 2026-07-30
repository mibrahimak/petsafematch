import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { FAQ_ITEMS } from '../../constants/helpContent';

import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import ProfileSection from '../../components/profile/ProfileSection';
import HelpScreenHeader from '../../components/help/HelpScreenHeader';
import FaqAccordionItem from '../../components/help/FaqAccordionItem';

export default function Faq() {
  const { colors } = useTheme();
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = useCallback((id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <ThemedView style={styles.container}>
      <HelpScreenHeader title='Sıkça Sorulan Sorular' />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={[styles.description, { color: colors.label }]}>
          En çok sorulan konulara hızlı yanıtlar.
        </ThemedText>

        <View style={styles.sections}>
          <ProfileSection title='SSS'>
            {FAQ_ITEMS.map((item, index) => (
              <FaqAccordionItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isExpanded={expandedId === item.id}
                onToggle={() => handleToggle(item.id)}
                isLast={index === FAQ_ITEMS.length - 1}
              />
            ))}
          </ProfileSection>
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
});
