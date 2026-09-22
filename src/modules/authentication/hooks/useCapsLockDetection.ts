import { useState, useCallback } from 'react';

/**
 * Hook to detect Caps Lock state on key events.
 * Note: Detection is unreliable on many mobile soft keyboards.
 * The pilot is APK-first, so this will mostly show up on desktop web testing.
 */
export function useCapsLockDetection() {
  const [capsLockOn, setCapsLockOn] = useState(false);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  }, []);

  const clearCapsLock = useCallback(() => {
    setCapsLockOn(false);
  }, []);

  return { capsLockOn, handleKeyDown, handleKeyUp, clearCapsLock };
}
