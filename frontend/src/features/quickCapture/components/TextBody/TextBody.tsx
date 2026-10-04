import { View, TextInput } from 'react-native';

import { useQCStore } from '@/stores/useQCStore';

import { COLORS } from '@/constants';

import { styles } from './TextBody.styles';

const TextBody = () => {
  const text = useQCStore((s) => s.text);
  const setText = useQCStore((s) => s.setText);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textBody}
        multiline
        placeholder="What are you praying for?"
        placeholderTextColor={COLORS.secondaryText}
        value={text}
        onChangeText={setText}
      />
    </View>
  );
};

export default TextBody;
