import { useState } from 'react';
import { Alert } from 'react-native';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddCategorySheet from '../AddCategorySheet/AddCategorySheet';

import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';
import { useDeleteCategoryMutation } from '@/hooks/TanStack/category/useDeleteCategoryMutation';

import type { Prayee } from '@/types/prayee';
import type { Category } from '@/types/category';

type CategorySidebarProp = {
  onSelect: (categoryId: string) => void;
  isSaving?: boolean;
  onClose: () => void;
};

const CategorySidebar = ({
  onSelect,
  isSaving = false,
  onClose,
}: CategorySidebarProp) => {
  const [isAdding, setIsAdding] = useState(false);

  const { data: category, isPending, isError } = useCategoriesQuery();
  const { mutate: removeCategory, isPending: isDeleting } =
    useDeleteCategoryMutation();

  const handleDelete = (item: Prayee | Category) => {
    Alert.alert(
      `Delete ${item.name}?`,
      `Any prayer requests in ${item.name} will keep their text, but will no longer have a category and will move back to your Inbox.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            removeCategory(item.id, {
              onError: (error) => Alert.alert('Delete failed', error.message),
            }),
        },
      ],
    );
  };

  return (
    <>
      <Sidebar
        title="Category"
        addLabel="Add a Category"
        emptyLabel="No categories yet. Add one to group your requests."
        items={category}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving || isDeleting}
        onDelete={handleDelete}
        onSelect={onSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      {isAdding && <AddCategorySheet onClose={() => setIsAdding(false)} />}
    </>
  );
};

export default CategorySidebar;
