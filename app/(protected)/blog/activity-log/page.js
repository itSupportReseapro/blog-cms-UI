'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import PdpButton from '@/assets/buttons/button';
import { UniversalTable } from '@/components/universal-table';

import PlusIcon from '@/assets/Images/icon/plus-icon.svg';

import './page.css';

const users = [
  { name: 'Eleanor Whitmore', email: 'sarah@example.com' },
  { name: 'Jonas K. Marlowe', email: 'mike@example.com' },
  { name: 'Priya Deshmukh', email: 'priya@example.com' },
  { name: 'Leonard Graystone', email: 'leonard@example.com' },
  { name: 'Marina Solberg', email: 'marina@example.com' },
  { name: 'Haruto Takeda', email: 'haruto@example.com' },
  { name: 'Selena Armitage', email: 'selena@example.com' },
  { name: 'Alex Roberts', email: 'alex.roberts@example.com' },
];

const actionPool = [
  'Created',
  'Updated',
  'Published',
  'Deleted',
  'Rollbacked',
  'Unpublished',
  'Changed',
];

const sectionPool = [
  'Blog Post : React Tips',
  'Privacy Policy',
  'New Blog : Web Design',
  'Draft : Old Post',
  'Rollback to Role',
  'New User : Alex Roberts',
  'User Role : Editor - Admin',
  'Term & Condition',
  'Contact Us',
];

const activityLogData = Array.from({ length: 600 }, (_, index) => {
  const id = index + 1;
  const user = users[index % users.length];
  const action = actionPool[index % actionPool.length];
  const section = sectionPool[index % sectionPool.length];

  const day = String(((index * 3) % 28) + 1).padStart(2, '0');
  const month = String(((index * 5) % 12) + 1).padStart(2, '0');
  const year = 2025;
  const hour = String(8 + (index % 11)).padStart(2, '0');
  const minute = String((index * 7) % 60).padStart(2, '0');

  return {
    id,
    serial: String(id).padStart(2, '0'),
    dateTime: `${day}/${month}/${year} ${hour}:${minute} ${Number(hour) >= 12 ? 'PM' : 'AM'}`,
    user: user.name,
    email: user.email,
    action,
    section,
  };
});

const activityLogColumns = [
  { field: 'serial', label: 'Sl.No.', sortable: false },
  { field: 'dateTime', label: 'Date & Time', sortable: true },
  { field: 'user', label: 'User', sortable: true },
  { field: 'email', label: 'Email', sortable: true },
  { field: 'action', label: 'Action', sortable: true },
  { field: 'section', label: 'Section', sortable: true },
];

export default function ActivityLogPage() {
  const filteredData = useMemo(() => activityLogData, []);

  const toolbarLeft = (
    <Link href="/blog/blogs/create" className="activity-createLink">
      <PdpButton
        variant="primary"
        size="md"
        radius="sm"
        icon={PlusIcon}
        iconPosition="left"
        className="activity-createBtn"
      >
        Create Blog
      </PdpButton>
    </Link>
  );

  return (
    <section className="activity-log-wrapper">

      <div className="activity-main-card">
        <div className="activity-table-wrapper">
          <UniversalTable
            variant="data"
            rows={filteredData}
            columns={activityLogColumns}
            toolbarLeft={toolbarLeft}
            searchPlaceholder="Search activity logs"
            rowKey="id"
            defaultPageSize={10}
            pageSizeOptions={[10, 25, 50]}
            breakpoint={768}
            enableFilters={true}
            showFilterButton={true}
            showFooter={true}
            exportFileBaseName="activity-log"
            bodyHeight={520}
          />
        </div>
      </div>
    </section>
  );
}
