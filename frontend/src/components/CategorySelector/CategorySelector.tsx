import { Pressable, Text } from "react-native";

import { styles } from "./CategorySelector.styles";

const CategorySelector = () => {
  return (
    <Pressable style={styles.container}>
      <Text style={styles.categoryText}>Select a category</Text>
    </Pressable>
  );
};

export default CategorySelector;
