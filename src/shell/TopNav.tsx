import { useState } from 'react';
import { CircleHelp, MessageSquare } from 'lucide-react';
import { Avatar, IconButton } from '@cake-admin/cakeand';
import lenovoLogo from '../assets/lenovo-logo.svg';
import userAvatar from '../assets/user-avatar.png';
import { AccountTypeahead } from '../sections/account-search/AccountTypeahead';
import '../sections/account-search/account-search.css';
import { navigate } from './router';

const MENU = [
  { label: 'Home', href: '#/overview' },
  { label: 'My Accounts', href: '#/overview', current: true },
  { label: 'Territory Heatmaps', href: '#/overview' },
  { label: 'Territory Insights', href: '#/overview' },
  { label: 'My New & Announcements', href: '#/overview' },
];

export function TopNav() {
  const [query, setQuery] = useState('');

  return (
    <header className="ce-topnav">
      <div className="ce-topnav__bar">
        <a className="ce-topnav__brand" href="#/overview">
          <span className="ce-topnav__logo">
            <img src={lenovoLogo} width={32} height={96} alt="Lenovo" />
          </span>
          Sales Sphere
        </a>

        <div className="ce-topnav__search">
          <AccountTypeahead
            value={query}
            onChange={setQuery}
            onSubmit={(q) => {
              window.location.hash = `/account-search?q=${encodeURIComponent(q.trim())}`;
            }}
            onPick={() => {
              setQuery('');
              navigate('overview');
            }}
          />
        </div>

        <div className="ce-topnav__actions">
          <IconButton label="Messages" icon={<MessageSquare />} intent="secondary" variant="ghost" size="sm" />
          <IconButton label="Help" icon={<CircleHelp />} intent="secondary" variant="ghost" size="sm" />
          <Avatar src={userAvatar} alt="Your profile" initials="DW" size="sm" onClick={() => {}} />
        </div>
      </div>

      <nav className="ce-topnav__menu" aria-label="Main">
        {MENU.map((m) => (
          <a key={m.label} className="ce-topnav__link" href={m.href} aria-current={m.current ? 'page' : undefined}>
            {m.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
