import {
  Bell,
  LayoutDashboard,
  Users,
} from 'lucide-react';

export const SUPERVISOR_NAV = [
  {
    section: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: <LayoutDashboard size={18} />,
        path: '/supervisor',
      },
    ],
  },
  {
    section: 'Students',
    items: [
      {
        label: 'Assigned Students',
        icon: <Users size={18} />,
        path: '/supervisor/assigned-students',
      },
    ],
  },
  {
    section: 'Evaluations',
    items: [
      {
        label: 'Students Evaluations',
        icon: <Users size={18} />,
        path: '/supervisor/students-evaluations',
      },
    ],
  },
   {
    section: "Notifications",
    items: [
      {
        label: "Notifications",
        icon: <Bell size={18} />,
        path: "/supervisor/notifications",
      },
    ],
  },

];