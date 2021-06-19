import { useEffect, useState } from 'react';

export default function useDebouncedValue<T>(value: T, delay = 0) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
