import Sidebar from '@/components/Sidebar/Sidebar';

import { usePrayeeQuery } from '@/hooks/TanStack/usePrayeesQuery';
import { useHomeStore } from '@/features/home/stores/useHomeStore';

const PrayeeSidebar = () => {
  const { data: prayees, isPending, isError } = usePrayeeQuery();
  const setSelectedprayerId = useHomeStore((s) => s.setSelectedPrayerId);

  return (
    <Sidebar
      title="Praying For"
      addLabel="Add a name"
      items={prayees}
      isPending={isPending}
      isError={isError}
      exit={() => setSelectedprayerId(null)}
    />
  );
};

export default PrayeeSidebar;
