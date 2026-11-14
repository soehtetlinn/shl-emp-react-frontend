import {
  Banknote,
  Briefcase,
  Building,
  Building2,
  FileText,
  Globe,
  GraduationCap,
  Landmark,
  ListChecks,
  Map,
  MapPin,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

/** Sidebar contents and landing page for each role. Paths must match the routes in App.jsx. */
export const NAVIGATION = {
  admin: {
    label: "Admin",
    home: "/admin/role",
    items: [
      { to: "/admin/role", label: "Roles", icon: ShieldCheck },
      { to: "/admin/position", label: "Positions", icon: Briefcase },
      { to: "/admin/department", label: "Departments", icon: Building },
      { to: "/admin/project-bid", label: "Project Bidding", icon: Banknote },
      { to: "/admin/portal-master", label: "Portal Master", icon: ListChecks },
    ],
  },
  hr: {
    label: "HR",
    home: "/hr/employee",
    items: [
      { to: "/hr/employee", label: "Employees", icon: Users },
      { to: "/hr/salary", label: "Salaries", icon: Banknote },
      { to: "/hr/leave-application", label: "Leave Applications", icon: FileText },
      { to: "/hr/company", label: "Companies", icon: Building2 },
      { to: "/hr/role", label: "Roles", icon: ShieldCheck },
      { to: "/hr/position", label: "Positions", icon: Briefcase },
      { to: "/hr/department", label: "Departments", icon: Building },
      { to: "/hr/country", label: "Countries", icon: Globe },
      { to: "/hr/state", label: "States", icon: Map },
      { to: "/hr/city", label: "Cities", icon: MapPin },
    ],
  },
  employee: {
    label: "Employee",
    home: "/employee/personal-info",
    items: [
      { to: "/employee/personal-info", label: "Personal Information", icon: User },
      { to: "/employee/education", label: "Education", icon: GraduationCap },
      { to: "/employee/family-info", label: "Dependents", icon: Users },
      { to: "/employee/work-experience", label: "Work Experience", icon: Landmark },
      { to: "/employee/leave-application", label: "Leave Applications", icon: FileText },
    ],
  },
};
