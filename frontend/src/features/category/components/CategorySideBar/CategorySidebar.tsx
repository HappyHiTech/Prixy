import Sidebar from '@/components/Sidebar/Sidebar';

import { useCategoriesQuery } from '@/hooks/TanStack/useCategoriesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

type CategorySidebarProp = {
  prayerId: string;
  onClose: () => void;
};

const CategorySidebar = ({ prayerId, onClose }: CategorySidebarProp) => {
  const { data: category, isPending, isError } = useCategoriesQuery();

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (categoryId: string) => {
    mutate({ id: prayerId, categoryId }, { onSuccess: onClose });
  };

  return (
    <Sidebar
      title="Category"
      addLabel="Add a Category"
      items={category}
      isPending={isPending}
      isError={isError}
      isSaving={isSaving}
      onSelect={handleSelect}
      onAdd={() => {}}
      exit={onClose}
    />
  );
};

export default CategorySidebar;
