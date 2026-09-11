import { useState } from 'react';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddCategorySheet from '../AddCategorySheet/AddCategorySheet';

import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';

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

  return (
    <>
      <Sidebar
        title="Category"
        addLabel="Add a Category"
        items={category}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving}
        onSelect={onSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      {isAdding && <AddCategorySheet onClose={() => setIsAdding(false)} />}
    </>
  );
};

export default CategorySidebar;
