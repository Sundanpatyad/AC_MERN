import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  AppDialog,
  DialogAction,
  DialogTone,
} from '../components/ui/AppDialog';

export type MessageOptions = {
  title: string;
  message: string;
  buttonText?: string;
  tone?: DialogTone;
};

export type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  tone?: DialogTone;
};

type DialogRequest = {
  title: string;
  message: string;
  tone: DialogTone;
  actions: DialogAction[];
};

type ShowFn = (request: DialogRequest) => Promise<boolean>;

let showDialog: ShowFn | null = null;

function ensureReady(): ShowFn {
  if (!showDialog) {
    throw new Error('DialogProvider is not mounted');
  }
  return showDialog;
}

export function showMessage(options: MessageOptions): Promise<void> {
  return ensureReady()({
    title: options.title,
    message: options.message,
    tone: options.tone ?? 'default',
    actions: [
      {
        label: options.buttonText ?? 'OK',
        variant: 'primary',
        onPress: () => {},
      },
    ],
  }).then(() => undefined);
}

export function showConfirm(options: ConfirmOptions): Promise<boolean> {
  return ensureReady()({
    title: options.title,
    message: options.message,
    tone: options.tone ?? 'default',
    actions: [
      {
        label: options.confirmText ?? 'Confirm',
        variant: options.confirmVariant ?? 'primary',
        onPress: () => {},
      },
      {
        label: options.cancelText ?? 'Cancel',
        variant: 'outline',
        onPress: () => {},
      },
    ],
  });
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [visible, setVisible] = useState(false);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const close = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setVisible(false);
  }, []);

  const show = useCallback<ShowFn>((next) => {
    resolverRef.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setRequest(next);
      setVisible(true);
    });
  }, []);

  showDialog = show;

  const actions = useMemo<DialogAction[]>(() => {
    if (!request) return [];
    const isConfirm = request.actions.length > 1;
    return request.actions.map((action, index) => ({
      ...action,
      onPress: () => close(isConfirm ? index === 0 : true),
    }));
  }, [close, request]);

  return (
    <>
      {children}
      <AppDialog
        isVisible={visible}
        title={request?.title ?? ''}
        message={request?.message ?? ''}
        tone={request?.tone ?? 'default'}
        actions={actions}
        onClose={() => close(false)}
      />
    </>
  );
}
