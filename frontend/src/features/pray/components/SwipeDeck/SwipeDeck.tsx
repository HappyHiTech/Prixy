import { View } from 'react-native';

import DeckCard, { type SwipeDecision } from '../DeckCard/DeckCard';
import type { DeckPrayer } from '@/types/deck';

import { styles } from './SwipeDeck.styles';

const VISIBLE_CARDS = 3;

type SwipeDeckProps = {
  prayers: DeckPrayer[];
  onSwiped: (prayer: DeckPrayer, decision: SwipeDecision) => void;
};

const SwipeDeck = ({ prayers, onSwiped }: SwipeDeckProps) => {
  return (
    <View style={styles.container}>
      {prayers.slice(0, VISIBLE_CARDS).map((prayer, index) => (
        <DeckCard
          key={prayer.id}
          prayer={prayer}
          index={index}
          onSwiped={onSwiped}
        />
      ))}
    </View>
  );
};

export default SwipeDeck;
