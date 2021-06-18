import { Select, SelectProps } from '@chakra-ui/select';
import { Skeleton } from '@chakra-ui/skeleton';
import { useCallback, useEffect } from 'react';
import { useLazyVsCurrenciesQuery } from 'store/api';

export interface SelectVsCurrencyProps extends SelectProps {
  onValueChange?: (value: string) => void;
}

export default function SelectVsCurrency({ onValueChange, ...props }: SelectVsCurrencyProps) {
  const [fetch, { data = [], isLoading }] = useLazyVsCurrenciesQuery();

  useEffect(() => fetch(), [fetch]);

  function renderOption(value: string) {
    return (
      <option key={value} value={value}>
        {value.toUpperCase()}
      </option>
    );
  }

  return (
    <Skeleton isLoaded={!isLoading}>
      <Select
        {...props}
        onChange={useCallback(e => {
          onValueChange?.(e.target.value);
          props.onChange?.(e);
        }, [])}
      >
        {data.map(renderOption)}
      </Select>
    </Skeleton>
  );
}
