import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const BubbleTail = ({ isMine, color }) => {
  return (
    <View
      style={[
        styles.tail,
        isMine ? styles.tailMine : styles.tailTheirs,
      ]}
      pointerEvents='none'
    >
      <Svg width={8} height={13} viewBox='0 0 8 13'>
        {isMine ? (
          <Path d='M0 13 Q0 6 8 0 L8 13 Z' fill={color} />
        ) : (
          <Path d='M8 13 Q8 6 0 0 L0 13 Z' fill={color} />
        )}
      </Svg>
    </View>
  );
};

export default memo(BubbleTail);

const styles = StyleSheet.create({
  tail: {
    position: 'absolute',
    bottom: 0,
  },
  tailMine: {
    right: -7,
  },
  tailTheirs: {
    left: -7,
  },
});
