import { useEffect, useState } from 'react';

// Hash routing keeps the prototype dependency-free and deep-linkable
// (#/contacts, #/notes …) without a router package.
export type RouteId =
  | 'overview'
  | 'contacts'
  | 'details'
  | 'documents'
  | 'notes'
  | 'customer-brief'
  | 'account-search'
  | 'executive-brief';

export const DEFAULT_ROUTE: RouteId = 'overview';

const ROUTES: RouteId[] = [
  'overview',
  'contacts',
  'details',
  'documents',
  'notes',
  'customer-brief',
  'account-search',
  'executive-brief',
];

const parse = (): RouteId => {
  const id = window.location.hash.replace(/^#\/?/, '').split('?')[0] as RouteId;
  return ROUTES.includes(id) ? id : DEFAULT_ROUTE;
};

export const navigate = (id: RouteId) => {
  window.location.hash = `/${id}`;
};

export function useRoute(): RouteId {
  const [route, setRoute] = useState<RouteId>(parse);
  useEffect(() => {
    const onChange = () => {
      setRoute(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
