import { useState, useEffect } from 'react';

/**
 * A custom hook to debounce a value.
 * @param {any} value The value to debounce (e.g., text from an input).
 * @param {number} delay The delay in milliseconds before the debounced value is updated.
 * @returns {any} The debounced value.
 */
function useDebounce(value, delay) {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Set up a timer to update the debounced value after the specified delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Clean up the timer if the value changes before the delay has passed
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-run the effect if the value or delay changes
  );

  return debouncedValue;
}

export default useDebounce;