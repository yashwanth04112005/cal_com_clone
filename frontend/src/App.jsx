import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import EventTypesPage from './pages/admin/EventTypesPage.jsx';
import BookingsPage from './pages/admin/BookingsPage.jsx';
import AvailabilityPage from './pages/admin/AvailabilityPage.jsx';
import AvailabilityDetailPage from './pages/admin/AvailabilityDetailPage.jsx';
import TeamsPage from './pages/admin/TeamsPage.jsx';
import RoutingPage from './pages/admin/RoutingPage.jsx';
import WorkflowsPage from './pages/admin/WorkflowsPage.jsx';
import WorkflowDetailPage from './pages/admin/WorkflowDetailPage.jsx';
import ReferEarnPage from './pages/admin/ReferEarnPage.jsx';
import AppStorePage from './pages/admin/AppStorePage.jsx';
import InstalledAppsPage from './pages/admin/InstalledAppsPage.jsx';
import InsightsPromoPage from './pages/admin/InsightsPromoPage.jsx';
import InsightsCallHistoryPage from './pages/admin/InsightsCallHistoryPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';
import CreateTeamPage from './pages/admin/CreateTeamPage.jsx';
import LandingPage from './pages/public/LandingPage.jsx';
import PublicProfilePage from './pages/public/PublicProfilePage.jsx';
import PublicBookingPage from './pages/public/PublicBookingPage.jsx';
import BookingConfirmationPage from './pages/public/BookingConfirmationPage.jsx';
import ReschedulePage from './pages/public/ReschedulePage.jsx';
import './styles/app.css';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/settings/*" element={<SettingsPage />} />
      <Route path="/admin/settings/*" element={<SettingsPage />} />
      <Route path="/settings/teams/new" element={<CreateTeamPage />} />
      <Route path="/admin/settings/teams/new" element={<CreateTeamPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="event-types" element={<EventTypesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:scope" element={<BookingsPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="availability/:scheduleId" element={<AvailabilityDetailPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="apps" element={<AppStorePage />} />
        <Route path="apps/installed" element={<InstalledAppsPage />} />
        <Route path="routing" element={<RoutingPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="workflows/:workflowId" element={<WorkflowDetailPage />} />
        <Route path="refer" element={<ReferEarnPage />} />
        <Route path="insights" element={<InsightsPromoPage sectionLabel="Bookings" />} />
        <Route path="insights/bookings" element={<InsightsPromoPage sectionLabel="Bookings" />} />
        <Route path="insights/routing" element={<InsightsPromoPage sectionLabel="Routing" />} />
        <Route path="insights/router-position" element={<InsightsPromoPage sectionLabel="Router position" />} />
        <Route path="insights/call-history" element={<InsightsCallHistoryPage />} />
        <Route path="insights/wrong-routing" element={<InsightsPromoPage sectionLabel="Wrong routing" />} />
      </Route>

      <Route path="/book/:slug" element={<PublicBookingPage />} />
      <Route path="/book/:slug/confirmation/:bookingId" element={<BookingConfirmationPage />} />
      <Route path="/reschedule/:token" element={<ReschedulePage />} />
      <Route path="/:username" element={<PublicProfilePage />} />
    </Routes>
  );
}
