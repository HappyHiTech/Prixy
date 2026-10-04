import { View, Text, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HandsPrayingIcon } from 'phosphor-react-native';

import { DARK_COLORS } from '@/constants';

import { styles } from './DeckComplete.styles';

type DeckCompleteProps = {
  prayedCount: number;
  againCount: number;
  onRestart: () => void;
};

const DeckComplete = ({
  prayedCount,
  againCount,
  onRestart,
}: DeckCompleteProps) => {
  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(400)}>
      <View style={styles.iconRing}>
        <HandsPrayingIcon size={32} color={DARK_COLORS.text} />
      </View>

      <Text style={styles.title}>Deck complete</Text>
      <Text style={styles.body}>
        You prayed through {prayedCount}{' '}
        {prayedCount === 1 ? 'request' : 'requests'} today.
        {againCount > 0 && ` ${againCount} will be back in tomorrow's deck.`}
      </Text>

      {/* MOCKUP ONLY: lets you replay the deck without restarting the app. */}
      <Pressable style={styles.button} onPress={onRestart}>
        <Text style={styles.buttonText}>Restart mock deck</Text>
      </Pressable>
    </Animated.View>
  );
};

export default DeckComplete;
