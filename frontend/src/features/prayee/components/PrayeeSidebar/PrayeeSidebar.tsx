import Sidebar from '@/components/Sidebar/Sidebar';

import { usePrayeeQuery } from '@/hooks/TanStack/usePrayeesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';
import { useHomeStore } from '@/features/home/stores/useHomeStore';

const PrayeeSidebar = () => {
  const { data: prayees, isPending, isError } = usePrayeeQuery();
  const selectedPrayerId = useHomeStore((s) => s.selectedPrayerId);
  const setSelectedprayerId = useHomeStore((s) => s.setSelectedPrayerId);

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (prayeeId: string) => {
    if (!selectedPrayerId) return;

    mutate(
      { id: selectedPrayerId, prayeeId },
      { onSuccess: () => setSelectedprayerId(null) },
    );
  };

  return (
    <Sidebar
      title="Praying For"
      addLabel="Add a name"
      items={prayees}
      isPending={isPending}
      isError={isError}
      isSaving={isSaving}
      onSelect={handleSelect}
      exit={() => setSelectedprayerId(null)}
    />
  );
};

export default PrayeeSidebar;
