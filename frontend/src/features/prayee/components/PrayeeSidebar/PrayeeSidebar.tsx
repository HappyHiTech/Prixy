import { useState } from 'react';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddPrayeeSheet from '../AddPrayeeSheet/AddPrayeeSheet';

import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';

type PrayeeSidebarProp = {
  onSelect: (prayeeId: string) => void;
  onClose: () => void;
  isSaving?: boolean;
};

const PrayeeSidebar = ({
  onSelect,
  onClose,
  isSaving = false,
}: PrayeeSidebarProp) => {
  const [isAdding, setIsAdding] = useState(false);

  const { data: prayees, isPending, isError } = usePrayeeQuery();

  return (
    <>
      <Sidebar
        title="Praying For"
        addLabel="Add a name"
        items={prayees}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving}
        onSelect={onSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      {isAdding && <AddPrayeeSheet onClose={() => setIsAdding(false)} />}
    </>
  );
};

export default PrayeeSidebar;
