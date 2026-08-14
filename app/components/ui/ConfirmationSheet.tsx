import React from 'react';
import { AppDialog, DialogTone } from './AppDialog';

interface ConfirmationSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  tone?: DialogTone;
}

export function ConfirmationSheet({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  tone = 'default',
}: ConfirmationSheetProps) {
  return (
    <AppDialog
      isVisible={isVisible}
      title={title}
      message={message}
      tone={tone}
      onClose={onClose}
      actions={[
        {
          label: cancelText,
          variant: 'outline',
          onPress: onClose,
        },
        {
          label: confirmText,
          variant: confirmVariant,
          destructive: tone === 'danger',
          onPress: () => {
            onConfirm();
            onClose();
          },
        },
      ]}
    />
  );
}
