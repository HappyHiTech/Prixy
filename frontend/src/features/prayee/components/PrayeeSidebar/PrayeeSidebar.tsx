import { useState } from 'react';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddPrayeeSheet from '../AddPrayeeSheet/AddPrayeeSheet';

import { usePrayeeQuery } from '@/hooks/TanStack/usePrayeesQuery';
import { useUpdatePrayerRequest } from '@/hooks/TanStack/useUpdatePrayerRequestMutation';

type PrayeeSidebarProp = {
  prayerId: string;
  onClose: () => void;
};

const PrayeeSidebar = ({ prayerId, onClose }: PrayeeSidebarProp) => {
  const [isAdding, setIsAdding] = useState(false);

  const { data: prayees, isPending, isError } = usePrayeeQuery();

  const { mutate, isPending: isSaving } = useUpdatePrayerRequest();

  const handleSelect = (prayeeId: string) => {
    mutate({ id: prayerId, prayeeId }, { onSuccess: onClose });
  };

  return (
    <>
      <Sidebar
        title="Praying For"
        addLabel="Add a name"
        items={prayees}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving}
        onSelect={handleSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      {isAdding && <AddPrayeeSheet onClose={() => setIsAdding(false)} />}
    </>
  );
};

export default PrayeeSidebar;
