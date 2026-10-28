import type { ReactNode } from 'react';
import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';
import { IconButton } from '@cake-admin/cakeand';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
};

/**
 * Component gap: Figma's 768px side drawer (Drawer_Credit_Detail, 10210:10294)
 * has no cake& counterpart. Built from tokens on the Radix Dialog primitive,
 * which provides role="dialog", aria-modal, focus trap / initial focus, Esc to
 * close and focus return. Scrim is --color-overlay-scrim.
 */
export function Drawer({ open, onOpenChange, title, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dt-drawer__scrim" />
        <Dialog.Content className="dt-drawer" aria-describedby={undefined}>
          <div className="dt-drawer__head">
            <Dialog.Title className="dt-drawer__title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton size="md" variant="ghost" intent="secondary" label="Close" icon={<X />} />
            </Dialog.Close>
          </div>
          <div className="dt-drawer__body">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
