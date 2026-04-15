import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout.jsx';
import EventTypesPage from './pages/admin/EventTypesPage.jsx';
import BookingsPage from './pages/admin/BookingsPage.jsx';
import AvailabilityPage from './pages/admin/AvailabilityPage.jsx';
import AvailabilityDetailPage from './pages/admin/AvailabilityDetailPage.jsx';
import TeamsPage from './pages/admin/TeamsPage.jsx';
import RoutingPage from './pages/admin/RoutingPage.jsx';
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

      <Route path="/admin" element={<AdminLayout />}>
        <Route path="event-types" element={<EventTypesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
        <Route path="availability" element={<AvailabilityPage />} />
        <Route path="availability/:scheduleId" element={<AvailabilityDetailPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="routing" element={<RoutingPage />} />
      </Route>

      <Route path="/book/:slug" element={<PublicBookingPage />} />
      <Route path="/book/:slug/confirmation/:bookingId" element={<BookingConfirmationPage />} />
      <Route path="/reschedule/:token" element={<ReschedulePage />} />
      <Route path="/:username" element={<PublicProfilePage />} />
    </Routes>
  );
}
