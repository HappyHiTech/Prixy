import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { HandsPrayingIcon } from 'phosphor-react-native';

import { DARK_COLORS } from '@/constants';

import { styles } from './DeckComplete.styles';

type DeckCompleteProps = {
  prayedCount: number;
  againCount: number;
};

const DeckComplete = ({ prayedCount, againCount }: DeckCompleteProps) => {
  const isEmpty = prayedCount === 0;

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(400)}>
      <View style={styles.iconRing}>
        <HandsPrayingIcon size={32} color={DARK_COLORS.text} />
      </View>

      <Text style={styles.title}>
        {isEmpty ? 'Nothing due today' : 'Deck complete'}
      </Text>
      <Text style={styles.body}>
        {isEmpty
          ? 'New requests, and recurring ones on their days, will show up here.'
          : `You prayed through ${prayedCount} ${
              prayedCount === 1 ? 'request' : 'requests'
            } today.${
              againCount > 0
                ? ` ${againCount} will be back in tomorrow's deck.`
                : ''
            }`}
      </Text>
    </Animated.View>
  );
};

export default DeckComplete;
