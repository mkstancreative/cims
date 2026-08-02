import type { ReactNode } from "react";

export type NavChild = {
  label: string;
  path: string;
};

export type NavItem = {
  label: string;
  icon: ReactNode;
  path?: string;
  children?: NavChild[];
};

export type NavSection = {
  section: string;
  items: NavItem[];
};
