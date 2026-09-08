import Sidebar from '@/components/Sidebar/Sidebar';

import { usePrayeeQuery } from '@/hooks/TanStack/usePrayeesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

type PrayeeSidebarProp = {
  prayerId: string;
  onClose: () => void;
};

const PrayeeSidebar = ({ prayerId, onClose }: PrayeeSidebarProp) => {
  const { data: prayees, isPending, isError } = usePrayeeQuery();

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (prayeeId: string) => {
    mutate({ id: prayerId, prayeeId }, { onSuccess: onClose });
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
      exit={onClose}
    />
  );
};

export default PrayeeSidebar;
