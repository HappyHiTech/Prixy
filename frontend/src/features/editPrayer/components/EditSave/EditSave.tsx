import { View, Text, Pressable } from 'react-native';
import { HandsPrayingIcon } from 'phosphor-react-native';

import { styles } from './EditSave.styles';

type EditSaveProp = {
  prayerId: string;
};

const EditSave = ({ prayerId }: EditSaveProp) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.card}>
        <HandsPrayingIcon color="#4A4A4A" />
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </View>
  );
};

export default EditSave;
