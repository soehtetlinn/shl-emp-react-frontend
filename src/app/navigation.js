import {
  Banknote,
  Briefcase,
  Building,
  Building2,
  FileText,
  Globe,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Map,
  MapPin,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";

/** Sidebar contents and landing page for each role. Paths must match the routes in App.jsx. */
export const NAVIGATION = {
  admin: {
    label: "Admin",
    home: "/admin/dashboard",
    groups: [
      { items: [{ to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
      {
        label: "Organisation",
        items: [
          { to: "/admin/role", label: "Roles", icon: ShieldCheck },
          { to: "/admin/position", label: "Positions", icon: Briefcase },
          { to: "/admin/department", label: "Departments", icon: Building },
        ],
      },
      {
        label: "Sales pipeline",
        items: [
          { to: "/admin/project-bid", label: "Project Bidding", icon: Banknote },
          { to: "/admin/portal-master", label: "Portal Master", icon: ListChecks },
        ],
      },
    ],
  },
  hr: {
    label: "HR",
    home: "/hr/dashboard",
    groups: [
      { items: [{ to: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
      {
        label: "People",
        items: [
          { to: "/hr/employee", label: "Employees", icon: Users },
          { to: "/hr/salary", label: "Salaries", icon: Banknote },
          { to: "/hr/leave-application", label: "Leave Applications", icon: FileText },
        ],
      },
      {
        label: "Organisation",
        items: [
          { to: "/hr/company", label: "Companies", icon: Building2 },
          { to: "/hr/department", label: "Departments", icon: Building },
          { to: "/hr/position", label: "Positions", icon: Briefcase },
          { to: "/hr/role", label: "Roles", icon: ShieldCheck },
        ],
      },
      {
        label: "Locations",
        items: [
          { to: "/hr/country", label: "Countries", icon: Globe },
          { to: "/hr/state", label: "States", icon: Map },
          { to: "/hr/city", label: "Cities", icon: MapPin },
        ],
      },
    ],
  },
  employee: {
    label: "Employee",
    home: "/employee/dashboard",
    groups: [
      { items: [{ to: "/employee/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
      {
        label: "My profile",
        items: [
          { to: "/employee/personal-info", label: "Personal Information", icon: User },
          { to: "/employee/education", label: "Education", icon: GraduationCap },
          { to: "/employee/family-info", label: "Dependents", icon: Users },
          { to: "/employee/work-experience", label: "Work Experience", icon: Landmark },
        ],
      },
      {
        label: "Time off and pay",
        items: [
          { to: "/employee/leave-application", label: "Leave Applications", icon: FileText },
          { to: "/employee/salary", label: "My Salary", icon: Wallet },
        ],
      },
    ],
  },
};
