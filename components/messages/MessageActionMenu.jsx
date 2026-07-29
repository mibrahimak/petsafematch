import { memo } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from '../ThemedText';

const MENU_WIDTH = 200;
const MENU_ITEM_HEIGHT = 48;

const MessageActionMenu = ({
  visible,
  anchor,
  isMine,
  onClose,
  onReply,
  onCopy,
  onDelete,
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  if (!visible || !anchor) return null;

  const menuHeight = MENU_ITEM_HEIGHT * 3;
  let top = anchor.y - menuHeight - 8;
  let left = isMine ? anchor.x + anchor.width - MENU_WIDTH : anchor.x;

  if (top < 16) top = anchor.y + anchor.height + 8;
  if (left < 16) left = 16;
  if (left + MENU_WIDTH > screenWidth - 16) {
    left = screenWidth - MENU_WIDTH - 16;
  }
  if (top + menuHeight > screenHeight - 16) {
    top = screenHeight - menuHeight - 16;
  }

  return (
    <Modal visible={visible} transparent animationType='fade' onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.menu, { top, left, width: MENU_WIDTH }]}>
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              onReply();
              onClose();
            }}
          >
            <Ionicons name='arrow-undo-outline' size={20} color='#FFF' />
            <ThemedText style={styles.menuText}>Yanıtla</ThemedText>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              onCopy();
              onClose();
            }}
          >
            <Ionicons name='copy-outline' size={20} color='#FFF' />
            <ThemedText style={styles.menuText}>Kopyala</ThemedText>
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => {
              onDelete();
              onClose();
            }}
          >
            <Ionicons name='trash-outline' size={20} color='#EF4444' />
            <ThemedText style={[styles.menuText, styles.deleteText]}>Sil</ThemedText>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

export default memo(MessageActionMenu);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  menu: {
    position: 'absolute',
    backgroundColor: '#1F2937',
    borderRadius: 14,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: MENU_ITEM_HEIGHT,
    gap: 14,
  },
  menuText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
});
