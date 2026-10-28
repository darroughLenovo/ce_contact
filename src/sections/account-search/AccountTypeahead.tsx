import { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { IconButton, MenuContainer, MenuHeader, MenuItem, TextInput } from '@cake-admin/cakeand';
import { search, type AccountRecord } from './accounts';
import { Highlight } from './Highlight';

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** Enter in the field — run the full search. */
  onSubmit: (v: string) => void;
  /** A result row was chosen. */
  onPick: (a: AccountRecord) => void;
  /** Show the results on mount (deep link ?ta=). */
  initialOpen?: boolean;
};

const MAX = 5;

function Meta({ a, query }: { a: AccountRecord; query: string }) {
  const bits = [
    a.region,
    a.idg && `IDG: ${a.idg}`,
    a.isg && `ISG: ${a.isg}`,
    a.alias && `Alias: ${a.alias}`,
  ].filter(Boolean) as string[];
  return (
    <span className="as-ta__meta">
      <Highlight text={bits.join(' • ')} query={query} />
    </span>
  );
}

/**
 * Global account typeahead (Figma 10210:10326 name match, 10210:10456 ID
 * match, 10210:10502 no result). Built to replace the top-nav search field.
 */
export function AccountTypeahead({ value, onChange, onSubmit, onPick, initialOpen = false }: Props) {
  const [open, setOpen] = useState(initialOpen);
  const wrap = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const results = value.trim() ? search(value).slice(0, MAX) : [];
  const showMenu = open && value.trim().length > 0;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const focusItem = (dir: 1 | -1) => {
    const items = Array.from(wrap.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = i < 0 ? (dir === 1 ? 0 : items.length - 1) : (i + dir + items.length) % items.length;
    items[next].focus();
  };

  return (
    <div
      className="as-ta"
      ref={wrap}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setOpen(false);
          wrap.current?.querySelector('input')?.focus();
        } else if (e.key === 'ArrowDown' && showMenu) {
          e.preventDefault();
          focusItem(1);
        } else if (e.key === 'ArrowUp' && showMenu) {
          e.preventDefault();
          focusItem(-1);
        }
      }}
    >
      <form
        className="as-ta__field"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setOpen(false);
          onSubmit(value);
        }}
      >
        <span className="as-ta__scope">Account Search</span>
        <div className="as-ta__input">
          <TextInput
            aria-label="Search for accounts"
            aria-controls={showMenu ? menuId : undefined}
            aria-expanded={showMenu}
            placeholder="Search for accounts"
            startIcon={<Search />}
            endIcon={
              value ? (
                <IconButton
                  size="xs"
                  intent="secondary"
                  variant="ghost"
                  label="Clear search"
                  icon={<X />}
                  onClick={() => {
                    onChange('');
                    wrap.current?.querySelector('input')?.focus();
                  }}
                />
              ) : undefined
            }
            value={value}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
          />
        </div>
      </form>

      {showMenu && (
        <div className="as-ta__pop">
          <MenuContainer id={menuId} width="100%" maxHeight="60vh" role="menu" aria-label="Matching accounts">
            {results.length ? (
              <>
                <MenuHeader>Accounts</MenuHeader>
                {results.map((a) => (
                  <MenuItem
                    key={a.id}
                    showLeftSlot={false}
                    showRightSlot={false}
                    className="as-ta__item"
                    onClick={() => {
                      setOpen(false);
                      onPick(a);
                    }}
                  >
                    <span className="as-ta__name">
                      <Highlight text={a.name} query={value} />
                    </span>
                    <Meta a={a} query={value} />
                  </MenuItem>
                ))}
              </>
            ) : (
              <div className="as-ta__empty" role="status">
                <strong>No accounts found</strong>
                <span>Try searching by account name, MDM ID or alias</span>
              </div>
            )}
          </MenuContainer>
        </div>
      )}
    </div>
  );
}
