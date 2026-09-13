import { View, Text } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { styles } from './FilterBox.styles';

type FilterBoxProp = {
  type: string;
};

const FilterBox = ({ type }: FilterBoxProp) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{type}</Text>
      <ChevronDown size={16} color="#999999" />
    </View>
  );
};

export default FilterBox;
