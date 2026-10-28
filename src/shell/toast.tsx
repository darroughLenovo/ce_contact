import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Toast as RadixToast } from 'radix-ui';
import { Toast } from '@cake-admin/cakeand';

type ToastStatus = 'info' | 'success' | 'warning' | 'error' | 'neutral';

export type ToastOptions = {
  title: ReactNode;
  description?: ReactNode;
  status?: ToastStatus;
  /** Optional single action, e.g. Undo. */
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type Entry = ToastOptions & { id: number; open: boolean };

const ToastContext = createContext<(t: ToastOptions) => void>(() => {});

/** `const showToast = useToast(); showToast({ status: 'success', title: 'Saved' })` */
export const useToast = () => useContext(ToastContext);

let nextId = 1;

/** One Radix Toast provider + viewport for the whole app (cake& Toast requires it). */
export function ToastHost({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Entry[]>([]);

  const show = useCallback((t: ToastOptions) => {
    setToasts((prev) => [...prev, { ...t, id: nextId++, open: true }]);
  }, []);

  const close = (id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)));
    // Leave time for the exit, then drop it.
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 300);
  };

  return (
    <ToastContext.Provider value={show}>
      <RadixToast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            open={t.open}
            onOpenChange={(open) => !open && close(t.id)}
            status={t.status ?? 'success'}
            title={t.title}
            description={t.description}
            duration={t.duration}
            primaryActionLabel={t.actionLabel}
            onPrimaryAction={
              t.onAction
                ? () => {
                    t.onAction?.();
                    close(t.id);
                  }
                : undefined
            }
            onDismiss={() => close(t.id)}
          />
        ))}
        <RadixToast.Viewport className="ce-toast-viewport" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}
