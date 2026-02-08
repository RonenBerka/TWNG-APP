import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import { T } from './theme/tokens';

// Lazy-loaded pages
const Homepage = lazy(() => import('./pages/Homepage'));
const Auth = lazy(() => import('./pages/Auth'));
const GuitarDetail = lazy(() => import('./pages/GuitarDetail'));
const AddGuitar = lazy(() => import('./pages/AddGuitar'));
const MyCollection = lazy(() => import('./pages/MyCollection'));
const Explore = lazy(() => import('./pages/Explore'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const LuthierDirectory = lazy(() => import('./pages/LuthierDirectory'));
const LuthierProfile = lazy(() => import('./pages/LuthierProfile'));
const Articles = lazy(() => import('./pages/Articles'));
const Forum = lazy(() => import('./pages/Forum'));
const Messaging = lazy(() => import('./pages/Messaging'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Decoder = lazy(() => import('./pages/Decoder'));
const ClaimGuitar = lazy(() => import('./pages/ClaimGuitar'));
const TransferGuitar = lazy(() => import('./pages/TransferGuitar'));
const MyTransfers = lazy(() => import('./pages/MyTransfers'));
const Notifications = lazy(() => import('./pages/Notifications'));
const About = lazy(() => import('./pages/About'));
const FoundingMembers = lazy(() => import('./pages/FoundingMembers'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading spinner
function PageLoader() {
  return (
    <div style={{
      minHeight: "60vh", display: "flex", alignItems: "center",
      justifyContent: "center", backgroundColor: T.bgDeep,
    }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        border: `3px solid ${T.border}`,
        borderTopColor: T.warm,
        animation: "spin 0.8s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Homepage uses transparent navbar (hero page) */}
            <Route path="/" element={
              <Layout transparent>
                <Homepage />
              </Layout>
            } />

            {/* Auth page - no footer, minimal chrome */}
            <Route path="/auth" element={
              <Layout noFooter>
                <Auth />
              </Layout>
            } />

            {/* Core Guitar Pages */}
            <Route path="/guitar/:id" element={
              <Layout>
                <GuitarDetail />
              </Layout>
            } />
            <Route path="/guitar/new" element={
              <Layout>
                <ProtectedRoute><AddGuitar /></ProtectedRoute>
              </Layout>
            } />

            {/* Discovery & Collection */}
            <Route path="/collection" element={
              <Layout>
                <ProtectedRoute><MyCollection /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/explore" element={
              <Layout>
                <Explore />
              </Layout>
            } />
            <Route path="/search" element={
              <Layout>
                <SearchResults />
              </Layout>
            } />

            {/* Profiles */}
            <Route path="/user/:username" element={
              <Layout>
                <UserProfile />
              </Layout>
            } />
            <Route path="/luthiers" element={
              <Layout>
                <LuthierDirectory />
              </Layout>
            } />
            <Route path="/luthier/:username" element={
              <Layout>
                <LuthierProfile />
              </Layout>
            } />

            {/* Content & Community */}
            <Route path="/articles" element={
              <Layout>
                <Articles />
              </Layout>
            } />
            <Route path="/articles/:id" element={
              <Layout>
                <Articles />
              </Layout>
            } />
            <Route path="/community" element={
              <Layout>
                <Forum />
              </Layout>
            } />
            <Route path="/community/:id" element={
              <Layout>
                <Forum />
              </Layout>
            } />
            <Route path="/messages" element={
              <Layout noFooter>
                <ProtectedRoute><Messaging /></ProtectedRoute>
              </Layout>
            } />

            {/* Tools */}
            <Route path="/decoder" element={
              <Layout>
                <Decoder />
              </Layout>
            } />

            {/* Info */}
            <Route path="/faq" element={
              <Layout>
                <FAQ />
              </Layout>
            } />
            <Route path="/about" element={
              <Layout>
                <About />
              </Layout>
            } />
            <Route path="/founding-members" element={
              <Layout>
                <FoundingMembers />
              </Layout>
            } />

            {/* Settings & Admin */}
            <Route path="/settings/*" element={
              <Layout>
                <ProtectedRoute><Settings /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/admin/*" element={
              <Layout noFooter>
                <AdminRoute><Admin /></AdminRoute>
              </Layout>
            } />

            {/* Claims & Transfers */}
            <Route path="/claim/:guitarId" element={
              <Layout>
                <ClaimGuitar />
              </Layout>
            } />
            <Route path="/transfer/:guitarId" element={
              <Layout>
                <ProtectedRoute><TransferGuitar /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/transfers" element={
              <Layout>
                <ProtectedRoute><MyTransfers /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/notifications" element={
              <Layout>
                <ProtectedRoute><Notifications /></ProtectedRoute>
              </Layout>
            } />

            {/* Legal pages */}
            <Route path="/legal/:page" element={
              <Layout>
                <Legal />
              </Layout>
            } />

            {/* Catch-all 404 route */}
            <Route path="*" element={
              <Layout>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
