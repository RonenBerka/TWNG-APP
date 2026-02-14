import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import { T } from './theme/tokens';

// Lazy-loaded pages
const Homepage = lazy(() => import('./pages/Homepage'));
const Auth = lazy(() => import('./pages/Auth'));
const InstrumentDetail = lazy(() => import('./pages/InstrumentDetail'));
const AddInstrument = lazy(() => import('./pages/AddInstrument'));
const MyCollection = lazy(() => import('./pages/MyCollection'));
const Explore = lazy(() => import('./pages/Explore'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Articles = lazy(() => import('./pages/Articles'));
const Messaging = lazy(() => import('./pages/Messaging'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const ArticleComposer = lazy(() => import('./pages/admin/ArticleComposer'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Decoder = lazy(() => import('./pages/Decoder'));
const TransferGuitar = lazy(() => import('./pages/TransferGuitar'));
const MyTransfers = lazy(() => import('./pages/MyTransfers'));
const Notifications = lazy(() => import('./pages/Notifications'));
const About = lazy(() => import('./pages/About'));
const FoundingMembers = lazy(() => import('./pages/FoundingMembers'));
const Legal = lazy(() => import('./pages/Legal'));
const NotFound = lazy(() => import('./pages/NotFound'));

// New pages - Forum
const ForumHome = lazy(() => import('./pages/ForumHome'));
const ForumCategory = lazy(() => import('./pages/ForumCategory'));
const NewThread = lazy(() => import('./pages/NewThread'));
const ThreadDetail = lazy(() => import('./pages/ThreadDetail'));

// New pages - Collections & Favorites
const CollectionsBrowse = lazy(() => import('./pages/CollectionsBrowse'));
const CollectionDetail = lazy(() => import('./pages/CollectionDetail'));
const CreateCollection = lazy(() => import('./pages/CreateCollection'));
const EditCollection = lazy(() => import('./pages/EditCollection'));
const MyCollections = lazy(() => import('./pages/MyCollections'));
const MyFavorites = lazy(() => import('./pages/MyFavorites'));

// New pages - Utility
const Contact = lazy(() => import('./pages/Contact'));
const PriceEvaluator = lazy(() => import('./pages/PriceEvaluator'));
const BackgroundRemoval = lazy(() => import('./pages/BackgroundRemoval'));
const TagsPage = lazy(() => import('./pages/TagsPage'));

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

            {/* Auth page */}
            <Route path="/auth" element={
              <Layout noFooter>
                <Auth />
              </Layout>
            } />

            {/* ============ Instruments ============ */}
            <Route path="/instrument/:id" element={
              <Layout>
                <InstrumentDetail />
              </Layout>
            } />
            {/* Legacy guitar route redirect */}
            <Route path="/guitar/:id" element={
              <Layout>
                <InstrumentDetail />
              </Layout>
            } />
            <Route path="/instrument/new" element={
              <Layout>
                <ProtectedRoute><AddInstrument /></ProtectedRoute>
              </Layout>
            } />

            {/* ============ Discovery ============ */}
            <Route path="/my-instruments" element={
              <Layout>
                <ProtectedRoute><MyCollection /></ProtectedRoute>
              </Layout>
            } />
            {/* Legacy route */}
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

            {/* ============ Collections ============ */}
            <Route path="/collections" element={
              <Layout>
                <CollectionsBrowse />
              </Layout>
            } />
            <Route path="/collections/new" element={
              <Layout>
                <ProtectedRoute><CreateCollection /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/collections/:id" element={
              <Layout>
                <CollectionDetail />
              </Layout>
            } />
            <Route path="/collections/:id/edit" element={
              <Layout>
                <ProtectedRoute><EditCollection /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/my-collections" element={
              <Layout>
                <ProtectedRoute><MyCollections /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/my-favorites" element={
              <Layout>
                <ProtectedRoute><MyFavorites /></ProtectedRoute>
              </Layout>
            } />

            {/* ============ Profiles ============ */}
            <Route path="/user/:username" element={
              <Layout>
                <UserProfile />
              </Layout>
            } />

            {/* ============ Forum ============ */}
            <Route path="/forum" element={
              <Layout>
                <ForumHome />
              </Layout>
            } />
            <Route path="/forum/new" element={
              <Layout>
                <ProtectedRoute><NewThread /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/forum/category/:slug" element={
              <Layout>
                <ForumCategory />
              </Layout>
            } />
            <Route path="/forum/thread/:id" element={
              <Layout>
                <ThreadDetail />
              </Layout>
            } />
            {/* Legacy community routes */}
            <Route path="/community" element={
              <Layout>
                <ForumHome />
              </Layout>
            } />

            {/* ============ Articles & Content ============ */}
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
            <Route path="/tags" element={
              <Layout>
                <TagsPage />
              </Layout>
            } />

            {/* ============ Social ============ */}
            <Route path="/messages" element={
              <Layout noFooter>
                <ProtectedRoute><Messaging /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/messages/:userId" element={
              <Layout noFooter>
                <ProtectedRoute><Messaging /></ProtectedRoute>
              </Layout>
            } />
            {/* Legacy redirect: /messaging → /messages */}
            <Route path="/messaging" element={<Navigate to="/messages" replace />} />
            <Route path="/notifications" element={
              <Layout>
                <ProtectedRoute><Notifications /></ProtectedRoute>
              </Layout>
            } />

            {/* ============ Transfers ============ */}
            <Route path="/transfer/:instrumentId" element={
              <Layout>
                <ProtectedRoute><TransferGuitar /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/transfers" element={
              <Layout>
                <ProtectedRoute><MyTransfers /></ProtectedRoute>
              </Layout>
            } />

            {/* ============ Tools ============ */}
            <Route path="/decoder" element={
              <Layout>
                <Decoder />
              </Layout>
            } />
            <Route path="/tools/price-evaluator" element={
              <Layout>
                <ProtectedRoute><PriceEvaluator /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/tools/background-removal" element={
              <Layout>
                <ProtectedRoute><BackgroundRemoval /></ProtectedRoute>
              </Layout>
            } />

            {/* ============ Info Pages ============ */}
            <Route path="/about" element={
              <Layout>
                <About />
              </Layout>
            } />
            <Route path="/contact" element={
              <Layout>
                <Contact />
              </Layout>
            } />
            <Route path="/faq" element={
              <Layout>
                <FAQ />
              </Layout>
            } />
            <Route path="/founding-members" element={
              <Layout>
                <FoundingMembers />
              </Layout>
            } />
            <Route path="/legal/:page" element={
              <Layout>
                <Legal />
              </Layout>
            } />

            {/* ============ Settings & Admin ============ */}
            <Route path="/settings/*" element={
              <Layout>
                <ProtectedRoute><Settings /></ProtectedRoute>
              </Layout>
            } />
            <Route path="/admin/articles/new" element={
              <Layout noFooter>
                <AdminRoute><ArticleComposer /></AdminRoute>
              </Layout>
            } />
            <Route path="/admin/articles/edit/:id" element={
              <Layout noFooter>
                <AdminRoute><ArticleComposer /></AdminRoute>
              </Layout>
            } />
            <Route path="/admin/*" element={
              <Layout noFooter>
                <AdminRoute><Admin /></AdminRoute>
              </Layout>
            } />

            {/* Catch-all 404 */}
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
