import { useState } from 'react';
import { Alert } from 'react-native';

import Sidebar from '@/components/Sidebar/Sidebar';
import AddPrayeeSheet from '../AddPrayeeSheet/AddPrayeeSheet';

import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useDeletePrayeeMutation } from '@/hooks/TanStack/prayee/useDeletePrayeeMutation';

import type { Prayee } from '@/types/prayee';
import type { Category } from '@/types/category';

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
  const { mutate: removePrayee, isPending: isDeleting } =
    useDeletePrayeeMutation();

  const handleDelete = (item: Prayee | Category) => {
    Alert.alert(
      `Delete ${item.name}?`,
      `Any prayer requests for ${item.name} will keep their text, but will no longer have anyone attached and will move back to your Inbox.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            removePrayee(item.id, {
              onError: (error) => Alert.alert('Delete failed', error.message),
            }),
        },
      ],
    );
  };

  return (
    <>
      <Sidebar
        title="Praying For"
        addLabel="Add a name"
        emptyLabel="No one here yet. Add a name to start praying for someone."
        items={prayees}
        isPending={isPending}
        isError={isError}
        isSaving={isSaving || isDeleting}
        onDelete={handleDelete}
        onSelect={onSelect}
        onAdd={() => setIsAdding(true)}
        exit={onClose}
      />

      {isAdding && <AddPrayeeSheet onClose={() => setIsAdding(false)} />}
    </>
  );
};

export default PrayeeSidebar;
