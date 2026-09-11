import { useState } from 'react';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddCategorySheet from '../AddCategorySheet/AddCategorySheet';

import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/prayerRequest/useUpdatePrayerRequestMutation';

type CategorySidebarProp = {
  prayerId: string;
  onClose: () => void;
};

const CategorySidebar = ({ prayerId, onClose }: CategorySidebarProp) => {
  const [isAdding, setIsAdding] = useState(false);

  const { data: category, isPending, isError } = useCategoriesQuery();

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (categoryId: string) => {
    mutate({ id: prayerId, categoryId }, { onSuccess: onClose });
  };

  return (
    <>
      <Sidebar
        title="Category"
        addLabel="Add a Category"
        items={category}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving}
        onSelect={handleSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      {isAdding && <AddCategorySheet onClose={() => setIsAdding(false)} />}
    </>
  );
};

export default CategorySidebar;
