import type { ReactNode } from 'react';
import { DropdownMenu } from 'radix-ui';
import { MenuContainer, MenuItem } from '@cake-admin/cakeand';

/**
 * Figma "Dropdown" (10210:20970 / 10210:20976). cake& ships the menu visuals
 * (MenuContainer + MenuItem) but no anchored popover, so the Radix
 * DropdownMenu primitive supplies positioning, focus and keyboard handling and
 * renders the cake& parts through `asChild`.
 */

export type MenuAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  /** Destructive rows (Archive, Delete) take the error colour, as in Figma. */
  danger?: boolean;
};

type Props = {
  trigger: ReactNode;
  label: string;
  items: MenuAction[];
  align?: 'start' | 'end';
};

export function ActionMenu({ trigger, label, items, align = 'end' }: Props) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild align={align} sideOffset={4} className="docs-menu">
          <MenuContainer aria-label={label} width="calc(var(--space-1000) * 2.5)">
            {items.map((it) => (
              <DropdownMenu.Item key={it.key} asChild onSelect={it.onSelect}>
                <MenuItem
                  leftSlot={it.icon}
                  showRightSlot={false}
                  className={it.danger ? 'docs-menu__danger' : undefined}
                >
                  {it.label}
                </MenuItem>
              </DropdownMenu.Item>
            ))}
          </MenuContainer>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export type ChoiceOption = { value: string; label: string };

/** A single- or multi-choice menu (Sort, Filters) — selected rows use MenuItem's selected treatment. */
export function ChoiceMenu({
  trigger,
  label,
  options,
  selected,
  onToggle,
  keepOpen,
  footer,
}: {
  trigger: ReactNode;
  label: string;
  options: ChoiceOption[];
  selected: string[];
  onToggle: (value: string) => void;
  keepOpen?: boolean;
  footer?: ReactNode;
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild align="start" sideOffset={4} className="docs-menu">
          <MenuContainer aria-label={label} width="calc(var(--space-1000) * 3)">
            {options.map((o) => {
              const on = selected.includes(o.value);
              return (
                <DropdownMenu.CheckboxItem
                  key={o.value}
                  asChild
                  checked={on}
                  onSelect={(e) => {
                    if (keepOpen) e.preventDefault();
                    onToggle(o.value);
                  }}
                >
                  <MenuItem selected={on} showLeftSlot={false} showRightSlot={on}>
                    {o.label}
                  </MenuItem>
                </DropdownMenu.CheckboxItem>
              );
            })}
            {footer}
          </MenuContainer>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
