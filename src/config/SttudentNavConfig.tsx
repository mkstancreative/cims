import {
  Bell,
  BookOpen,
  Briefcase,
  LayoutDashboard,
  FileText,
  ListChecks,
  GraduationCap,
  Award,
  User,
} from "lucide-react";

export const STUDENT_NAV = [
  {
    section: "Overview",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        path: "/student",
      },
    ],
  },
  {
    section: "Training",
    items: [
      {
        label: "Curriculum",
        icon: <GraduationCap size={18} />,
        path: "/student/curriculum",
      },
      {
        label: "Log Book",
        icon: <BookOpen size={18} />,
        path: "/student/logbook",
      },
      {
        label: "Quiz",
        icon: <ListChecks size={18} />,
        path: "/student/quiz",
      },
    ],
  },
  {
    section: "Placement",
    items: [
      {
        label: "Internships",
        icon: <Briefcase size={18} />,
        path: "/student/internships",
      },
      {
        label: "Evaluation",
        icon: <Award size={18} />,
        path: "/student/evaluation",
      },
      {
        label: "Certificate",
        icon: <FileText size={18} />,
        path: "/student/certificate",
      },
    ],
  },
  {
    section: "Account",
    items: [
      {
        label: "Notifications",
        icon: <Bell size={18} />,
        path: "/student/notifications",
      },
      {
        label: "Profile",
        icon: <User size={18} />,
        path: "/student/profile",
      },
    ],
  },
];
