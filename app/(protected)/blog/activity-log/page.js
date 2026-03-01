'use client';

import Table from '@/assets/ui/tables/Table';
import './page.css';

const activityLogData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  user: ['John Doe', 'Jane Smith', 'Alice Brown', 'Bob Wilson'][Math.floor(Math.random() * 4)],
  action: ['Created', 'Updated', 'Deleted', 'Published', 'Archived'][Math.floor(Math.random() * 5)],
  resource: ['Post', 'Comment', 'Category', 'User', 'Setting'][Math.floor(Math.random() * 5)],
  status: ['success', 'pending', 'error'][Math.floor(Math.random() * 3)],
}));

const activityLogColumns = [
  { key: 'id', label: 'ID', width: '60px', sortable: false },
  { key: 'timestamp', label: 'Timestamp', width: '120px', sortable: true },
  { key: 'user', label: 'User', width: '150px', sortable: true },
  { key: 'action', label: 'Action', width: '100px', sortable: true },
  { key: 'resource', label: 'Resource', width: '120px', sortable: true },
  { key: 'status', label: 'Status', width: '100px', sortable: true },
];

export default function ActivityLogPage() {
  const handleActivityAction = (actionKey, row) => {
    console.log(`Activity Action: ${actionKey}`, row);

    switch (actionKey) {
      case "details":
        window.addSnackbar?.(`Viewing details for: ${row.resource}`, "info");
        break;
      case "undo":
        window.addSnackbar?.(`Undo action: ${row.action} on ${row.resource}`, "info");
        break;
      default:
        break;
    }
  };

  return (
    <section className="activity-log-section">
      <div className="activity-log-header">
        <div>
          <h1>Activity Log</h1>
          <p>Track all user activities and system events</p>
        </div>
      </div>

      <div className="activity-log-table-wrapper">
        <Table
          data={activityLogData}
          columns={activityLogColumns}
          onActionExecute={handleActivityAction}
        />
      </div>
    </section>
  );
}
