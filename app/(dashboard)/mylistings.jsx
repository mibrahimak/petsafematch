import React, { useCallback, useContext, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useRefresh } from '../../hooks/useRefresh';
import { useMyListings } from '../../hooks/useMyListings';

import CreateListingModal from '../../components/CreateListingModal';
import ThemedView from '../../components/ThemedView';
import MyListingsHeader from '../../components/mylistings/MyListingsHeader';
import MyListingsSummaryRow from '../../components/mylistings/MyListingsSummaryRow';
import MyListingsFilterTabs from '../../components/mylistings/MyListingsFilterTabs';
import MyListingCard from '../../components/mylistings/MyListingCard';
import MyListingsEmptyState from '../../components/mylistings/MyListingsEmptyState';

export default function MyListings() {
  const { user } = useContext(AuthContext);
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    filteredListings,
    loading,
    activeFilter,
    setActiveFilter,
    counts,
    fetchMyListings,
    handleDeleteListing,
    filterTabs,
  } = useMyListings(user?.id);

  const { refreshing, onRefresh } = useRefresh(fetchMyListings);

  const handleCreatePress = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <MyListingCard listing={item} onDelete={handleDeleteListing} />
    ),
    [handleDeleteListing]
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const ListHeader = useCallback(
    () => (
      <View>
        <MyListingsHeader
          totalCount={counts.all}
          activeCount={counts.active}
          onCreatePress={handleCreatePress}
        />
        <MyListingsSummaryRow counts={counts} />
        <MyListingsFilterTabs
          tabs={filterTabs}
          activeFilter={activeFilter}
          counts={counts}
          onFilterChange={setActiveFilter}
        />
      </View>
    ),
    [counts, filterTabs, activeFilter, setActiveFilter, handleCreatePress]
  );

  const ListEmpty = useCallback(
    () =>
      !loading ? (
        <MyListingsEmptyState
          filter={activeFilter}
          onCreatePress={handleCreatePress}
        />
      ) : null,
    [loading, activeFilter, handleCreatePress]
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size='large' color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlashList
        data={filteredListings}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={160}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      />

      <CreateListingModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onRefreshListings={fetchMyListings}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
});
