import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  Layers,
  Users,
  Bell,
  FileText,
  BookOpen,
  ListChecks,
  ClipboardList,
  ClipboardCheck,
  Clock,
  Briefcase,
  Trophy,
  Settings,
  Receipt,
} from "lucide-react";

export const ADMIN_NAV = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/admin",
      },
      {
        label: "Registrations",
        icon: <ClipboardList size={18} />,
        path: "/admin/registrations",
      },
      {
        label: "Payments",
        icon: <Receipt size={18} />,
        path: "/admin/payments",
      },
    ],
  },
  {
    section: "Setup",
    items: [
      {
        label: "Institutions",
        icon: <Building2 size={18} />,
        path: "/admin/institutions",
      },
      {
        label: "Batches",
        icon: <Layers size={18} />,
        path: "/admin/batches",
      },
      {
        label: "Curriculum",
        icon: <BookOpen size={18} />,
        path: "/admin/curriculum",
      },
      {
        label: "Quizzes",
        icon: <ListChecks size={18} />,
        path: "/admin/quizzes",
      },
      {
        label: "Durations",
        icon: <Clock size={18} />,
        path: "/admin/durations",
      },
    ],
  },
  {
    section: "People",
    items: [
      {
        label: "Students",
        icon: <GraduationCap size={18} />,
        children: [
          { label: "All Students", path: "/admin/students" },
          { label: "Unassigned Students", path: "/admin/unassigned-students" },
        ],
      },
      {
        label: "Supervisors",
        icon: <Users size={18} />,
        path: "/admin/supervisors",
      },
    ],
  },
  {
    section: "Placements",
    items: [
      {
        label: "Internships",
        icon: <Briefcase size={18} />,
        path: "/admin/internships",
      },
      {
        label: "Quiz Sittings",
        icon: <ClipboardCheck size={18} />,
        path: "/admin/quiz-sittings",
      },
      {
        label: "Results",
        icon: <Trophy size={18} />,
        path: "/admin/results",
      },
      {
        label: "Certificates",
        icon: <FileText size={18} />,
        path: "/admin/certificates",
      },
    ],
  },
  {
    section: "System",
    items: [
      {
        label: "Notifications",
        icon: <Bell size={18} />,
        path: "/admin/notifications",
      },
      {
        label: "Settings",
        icon: <Settings size={18} />,
        path: "/admin/settings",
      },
    ],
  },
];
