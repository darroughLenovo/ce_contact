import { lazy, Suspense } from 'react';
import { CakeProvider, Spinner } from '@cake-admin/cakeand';
import { SideRail } from './shell/SideRail';
import { ToastHost } from './shell/toast';
import { TopNav } from './shell/TopNav';
import { useRoute, type RouteId } from './shell/router';
import './shell/shell.css';

// Each section loads on demand, so a broken or half-built section only takes
// down its own route instead of the whole app.
const PAGES: Record<RouteId, React.LazyExoticComponent<() => React.JSX.Element>> = {
  overview: lazy(() => import('./sections/overview/OverviewPage')),
  contacts: lazy(() => import('./sections/contacts/ContactsPage')),
  details: lazy(() => import('./sections/details/DetailsPage')),
  documents: lazy(() => import('./sections/documents/DocumentsPage')),
  notes: lazy(() => import('./sections/notes/NotesPage')),
  'customer-brief': lazy(() => import('./sections/customer-brief/CustomerBriefPage')),
  'account-search': lazy(() => import('./sections/account-search/AccountSearchPage')),
  'executive-brief': lazy(() => import('./sections/executive-brief/ExecutiveBriefPage')),
};

export default function App() {
  const route = useRoute();
  const Page = PAGES[route];

  return (
    // Exactly ONE CakeProvider, at the root. Its mode must match data-theme in
    // index.html. It sets data-theme on <html> so portalled Modals, Dropdowns
    // and Tooltips stay themed.
    <CakeProvider mode="light.a">
      <ToastHost>
      <div className="ce-app">
        <TopNav />
        <div className="ce-body">
          <SideRail />
          <main className="ce-main">
            <Suspense fallback={<div className="ce-page"><Spinner aria-label="Loading" /></div>}>
              <Page />
            </Suspense>
          </main>
        </div>
      </div>
      </ToastHost>
    </CakeProvider>
  );
}
