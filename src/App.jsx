import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import { NAVIGATION } from "./app/navigation.js";
import AppLayout from "./components/AppLayout.jsx";
import ResourcePage from "./components/ResourcePage.jsx";
import EmployeeDetailPage from "./pages/EmployeeDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PersonalInfoPage from "./pages/PersonalInfoPage.jsx";
import { portalResource, projectBidResource } from "./resources/admin.js";
import { cityResource, countryResource, stateResource } from "./resources/locations.js";
import { companyResource, departmentResource, positionResource, roleResource } from "./resources/organization.js";
import { employeeResource, leaveReviewResource, salaryResource } from "./resources/people.js";
import {
  educationResource,
  familyResource,
  leaveApplicationResource,
  workExperienceResource,
} from "./resources/profile.js";

/** Lets a signed-in user of the given role through; sends everyone else where they belong. */
function RequireRole({ role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={NAVIGATION[user.role].home} replace />;
  return <AppLayout />;
}

/** Scopes the employee's own screens to the signed-in user. */
function OwnRecords() {
  const { user } = useAuth();
  return <Outlet context={{ employeeId: user.id }} />;
}

function Home() {
  const { user } = useAuth();
  return <Navigate to={user ? NAVIGATION[user.role].home : "/login"} replace />;
}

// `key` gives every screen its own state, so switching between two resource pages starts clean.
const crud = (path, resource) => <Route key={path} path={path} element={<ResourcePage key={path} resource={resource} />} />;

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<RequireRole role="admin" />}>
            <Route index element={<Navigate to="role" replace />} />
            {crud("role", roleResource)}
            {crud("position", positionResource)}
            {crud("department", departmentResource)}
            {crud("project-bid", projectBidResource)}
            {crud("portal-master", portalResource)}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/hr" element={<RequireRole role="hr" />}>
            <Route index element={<Navigate to="employee" replace />} />
            {crud("employee", employeeResource)}
            <Route path="employee/:employeeId" element={<EmployeeDetailPage />}>
              <Route index element={<Navigate to="personal-info" replace />} />
              <Route path="personal-info" element={<PersonalInfoPage />} />
              {crud("education", educationResource)}
              {crud("family-info", familyResource)}
              {crud("work-experience", workExperienceResource)}
            </Route>
            {crud("salary", salaryResource)}
            {crud("leave-application", leaveReviewResource)}
            {crud("company", companyResource)}
            {crud("role", roleResource)}
            {crud("position", positionResource)}
            {crud("department", departmentResource)}
            {crud("country", countryResource)}
            {crud("state", stateResource)}
            {crud("city", cityResource)}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/employee" element={<RequireRole role="employee" />}>
            <Route element={<OwnRecords />}>
              <Route index element={<Navigate to="personal-info" replace />} />
              <Route path="personal-info" element={<PersonalInfoPage />} />
              {crud("education", educationResource)}
              {crud("family-info", familyResource)}
              {crud("work-experience", workExperienceResource)}
              {crud("leave-application", leaveApplicationResource)}
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
