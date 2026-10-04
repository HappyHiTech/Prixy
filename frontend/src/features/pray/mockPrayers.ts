import type { PrayerRequestFrequencyType } from '@/types/prayerRequest';

// MOCKUP DATA — stands in for the Active Deck until pray mode is wired to
// usePrayerRequests('active'). The shape is the joined view a card needs
// (request + prayee name + category), not a raw PrayerRequest row.
export type MockPrayer = {
  id: string;
  prayeeName: string;
  categoryName: string;
  categoryIcon: string;
  requestText: string;
  frequencyType: PrayerRequestFrequencyType;
  daysAgo: number;
};

export const MOCK_PRAYERS: MockPrayer[] = [
  {
    id: 'p1',
    prayeeName: 'Mom',
    categoryName: 'Health',
    categoryIcon: 'stethoscope',
    requestText:
      'Healing and a quick recovery after her knee surgery on Thursday.',
    frequencyType: 'recurring',
    daysAgo: 2,
  },
  {
    // Deliberately long: checks how the card handles overflowing text.
    id: 'p-long',
    prayeeName: 'Uncle Ben',
    categoryName: 'Loved ones',
    categoryIcon: 'heart',
    requestText:
      'Strength for him and Aunt Mei as they care for Grandpa after the stroke. Wisdom for the doctors deciding on rehab versus home care, provision for the medical bills that insurance won’t cover, and that the cousins would stop arguing and pull together. Also rest for Uncle Ben himself — he hasn’t slept properly in weeks and is still trying to keep the restaurant open.',
    frequencyType: 'recurring',
    daysAgo: 4,
  },
  {
    // Deliberately long: checks the name truncates and the stamp covers it.
    id: 'p-long-name',
    prayeeName: 'Pastor Jonathan Whitfield-Abernathy',
    categoryName: 'Church',
    categoryIcon: 'church',
    requestText: 'Rest and renewal during his sabbatical this month.',
    frequencyType: 'one_time',
    daysAgo: 5,
  },
  {
    id: 'p2',
    prayeeName: 'Daniel Park',
    categoryName: 'Work',
    categoryIcon: 'briefcase',
    requestText:
      'Wisdom and peace as he decides whether to take the job in Seattle.',
    frequencyType: 'one_time',
    daysAgo: 1,
  },
  {
    id: 'p3',
    prayeeName: 'Small Group',
    categoryName: 'Church',
    categoryIcon: 'church',
    requestText:
      'That we keep showing up for each other through a busy season.',
    frequencyType: 'recurring',
    daysAgo: 6,
  },
  {
    id: 'p4',
    prayeeName: 'Grace Lim',
    categoryName: 'School',
    categoryIcon: 'graduation-cap',
    requestText: 'Focus and calm for her board exams next week.',
    frequencyType: 'one_time',
    daysAgo: 3,
  },
  {
    id: 'p5',
    prayeeName: 'The Okafor family',
    // Deliberately long: checks the category line truncates cleanly.
    categoryName: 'Missionaries & Global Outreach',
    categoryIcon: 'globe',
    requestText:
      'Safe travels and open doors as they settle into their new placement in Lagos.',
    frequencyType: 'recurring',
    daysAgo: 12,
  },
  {
    id: 'p6',
    prayeeName: 'Me',
    categoryName: 'Loved ones',
    categoryIcon: 'heart',
    requestText:
      'Patience with my brother, and the words to start a hard conversation.',
    frequencyType: 'one_time',
    daysAgo: 0,
  },
];
