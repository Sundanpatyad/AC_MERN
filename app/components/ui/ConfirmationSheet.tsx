import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Button } from './Button';
import { Palette, Radii } from '@/constants/theme';

interface ConfirmationSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
}

export function ConfirmationSheet({
  isVisible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary'
}: ConfirmationSheetProps) {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.sheet}>
          <View style={styles.indicator} />
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.actions}>
            <Button 
              title={confirmText} 
              onPress={() => {
                onConfirm();
                onClose();
              }}
              variant={confirmVariant}
              style={styles.button}
            />
            <Button 
              title={cancelText} 
              onPress={onClose} 
              variant="outline"
              style={styles.button}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Palette.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderWidth: 1,
    borderColor: Palette.borderStrong,
    padding: 24,
    paddingTop: 12,
    width: '100%',
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: Palette.borderStrong,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  actions: {
    gap: 8,
  },
  button: {
    width: '100%',
    marginVertical: 4,
  },
});
