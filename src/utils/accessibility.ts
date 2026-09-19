import React from 'react';

export function handleKeyboardClick(
  event: React.KeyboardEvent,
  action: () => void
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

export function generateAriaDescribedBy(
  fieldId: string,
  error?: string | null,
  helperText?: string
): string | undefined {
  const ids: string[] = [];
  if (error) ids.push(`${fieldId}-error`);
  if (helperText) ids.push(`${fieldId}-helper`);
  return ids.length > 0 ? ids.join(' ') : undefined;
}
