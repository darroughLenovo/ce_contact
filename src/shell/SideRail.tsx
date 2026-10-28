import { Menu } from 'lucide-react';
import { IconButton } from '@cake-admin/cakeand';

/** Figma "Side Bar - Collapsed" (10210:15608): the collapsed accounts menu. */
export function SideRail() {
  return (
    <aside className="ce-rail" aria-label="All accounts">
      <IconButton label="Expand all accounts menu" icon={<Menu />} intent="secondary" variant="ghost" size="sm" />
    </aside>
  );
}
