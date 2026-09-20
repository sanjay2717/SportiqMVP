import { useCallback } from 'react';

/**
 * useNumericInput
 *
 * Returns a stable `onKeyDown` handler that blocks non-numeric keystrokes on
 * <input type="number"> fields. Prevents the browser from accepting 'e', '+',
 * '-', and any other non-digit character that type="number" normally admits.
 *
 * @param setError  State setter for the screen's error string. The hook sets
 *                  "Enter numbers only." on a blocked keystroke and clears it
 *                  again when the user types a valid digit.
 * @param allowDecimal  When true, a single '.' is permitted (e.g. weight in kg).
 *                      The hook prevents a second '.' being entered.
 *
 * Usage:
 *   const heightKeyDown = useNumericInput(setError);
 *   const weightKeyDown = useNumericInput(setError, true);
 *   <input type="number" onKeyDown={heightKeyDown} ... />
 *   <input type="number" onKeyDown={weightKeyDown} ... />
 *
 * Screens currently using this hook:
 *   - PersonalInformationScreen  (age, height — integers; weight — decimal)
 *   - EditProfileScreen           (heightCm — integer; weightKg — decimal)
 *
 * Future candidates:
 *   - PlayingInformationScreen   (years_of_experience — integer)
 */
export function useNumericInput(
  setError: (msg: string) => void,
  allowDecimal = false,
) {
  return useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Pass control/navigation keys through without any side-effects.
      if (
        [
          'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
          'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
        ].includes(e.key) ||
        e.ctrlKey || e.metaKey || e.altKey
      ) {
        return;
      }

      // Allow a single decimal point when the field supports it.
      if (allowDecimal && e.key === '.') {
        if (e.currentTarget.value.includes('.')) {
          // Second dot — block silently (no error, just prevent).
          e.preventDefault();
        }
        return;
      }

      // Block everything that is not a decimal digit.
      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setError('Enter numbers only.');
      } else {
        // Valid digit — clear the error if it was set by this hook.
        setError('');
      }
    },
    // allowDecimal is a primitive boolean — safe to include.
    // setError is expected to be a stable setState setter (identity-stable).
    [allowDecimal, setError],
  );
}
