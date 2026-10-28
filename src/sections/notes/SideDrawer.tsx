import type { ReactNode } from 'react';
import { Dialog } from 'radix-ui';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible title (rendered visibly by the caller's header via `title`). */
  title: ReactNode;
  /** Optional lines under the title (meta, tags). */
  subtitle?: ReactNode;
  /** Header actions on the right (Cancel/Save, Edit/Close…). */
  actions?: ReactNode;
  children: ReactNode;
  /** View mode uses the larger CE/H3 title (Figma Note 14373:63030). */
  largeTitle?: boolean;
};

/**
 * COMPONENT GAP — cake& ships no side drawer / sheet. Figma draws 768px
 * right-hand panels ("Add Note" 14373:62601, "Note" 14373:63030) over
 * Modal/Scrim. Built on the Radix Dialog primitive (role="dialog",
 * aria-modal, focus trap + focus moved in, Esc and scrim click close) and
 * styled only with cake& tokens.
 */
export function SideDrawer({ open, onOpenChange, title, subtitle, actions, children, largeTitle }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="notes-drawer__scrim" />
        <Dialog.Content className="notes-drawer" aria-describedby={undefined}>
          <header className="notes-drawer__header">
            <div className="notes-drawer__heading">
              <Dialog.Title className={largeTitle ? 'notes-drawer__title notes-drawer__title--lg' : 'notes-drawer__title'}>{title}</Dialog.Title>
              {subtitle}
            </div>
            {actions && <div className="notes-drawer__actions">{actions}</div>}
          </header>
          <div className="notes-drawer__body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
