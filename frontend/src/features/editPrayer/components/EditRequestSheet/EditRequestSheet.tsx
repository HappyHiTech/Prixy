import { useState } from 'react';
import { TextInput } from 'react-native';

import BottomSheet from '@/components/BottomSheet/BottomSheet';

import { styles } from './EditRequestSheet.styles';

type EditRequestSheetProps = {
  initialText: string;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
};

const EditRequestSheet = ({
  initialText,
  isSaving = false,
  onClose,
  onSave,
}: EditRequestSheetProps) => {
  const [text, setText] = useState(initialText);

  const trimmed = text.trim();
  const isUnchanged = trimmed === initialText.trim();

  return (
    <BottomSheet
      title="Edit request"
      canSave={!isUnchanged && trimmed !== ''}
      isSaving={isSaving}
      onClose={onClose}
      onSave={() => onSave(trimmed)}
    >
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        numberOfLines={8}
        multiline
        autoFocus
        placeholder="What are you praying for?"
      />
    </BottomSheet>
  );
};

export default EditRequestSheet;
