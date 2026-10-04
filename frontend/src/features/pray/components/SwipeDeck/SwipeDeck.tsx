import { View } from 'react-native';

import DeckCard, { type SwipeDecision } from '../DeckCard/DeckCard';
import type { MockPrayer } from '../../mockPrayers';

import { styles } from './SwipeDeck.styles';

// Only the top few cards are mounted; the rest of the deck doesn't need to
// exist until it's close to being seen.
const VISIBLE_CARDS = 3;

type SwipeDeckProps = {
  prayers: MockPrayer[];
  onSwiped: (prayer: MockPrayer, decision: SwipeDecision) => void;
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
