import Sidebar from '@/components/Sidebar/Sidebar';

import { useCategoriesQuery } from '@/hooks/TanStack/useCategoriesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

import { useHomeStore } from '@/features/home/stores/useHomeStore';

const CategorySidebar = () => {
  const { data: category, isPending, isError } = useCategoriesQuery();

  const selectedPrayerId = useHomeStore((s) => s.selectedPrayerId);
  const setSelectedprayerId = useHomeStore((s) => s.setSelectedPrayerId);
  const setSelectedEdit = useHomeStore((s) => s.setSelectedEdit);

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (categoryId: string) => {
    if (!selectedPrayerId) return;

    mutate(
      { id: selectedPrayerId, categoryId },
      {
        onSuccess: () => {
          setSelectedprayerId(null);
          setSelectedEdit(null);
        },
      },
    );
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
      exit={() => {
        setSelectedprayerId(null);
        setSelectedEdit(null);
      }}
    />
  );
};

export default CategorySidebar;
