import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import ThemedText from '../ThemedText';
import { LISTING_TABS } from '../../constants/listingOptions';

const ListingTabBar = ({ activeTab, onChange }) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.uiBackground,
          borderColor: colors.borderColor,
        },
      ]}
    >
      {LISTING_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            style={[
              styles.tab,
              isActive && { backgroundColor: colors.primary },
            ]}
            onPress={() => onChange(tab.id)}
          >
            <ThemedText
              style={[
                styles.tabLabel,
                { color: isActive ? colors.onPrimary : colors.label },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default memo(ListingTabBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
