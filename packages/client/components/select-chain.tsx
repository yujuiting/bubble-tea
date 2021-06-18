import { Select, SelectProps } from '@chakra-ui/select';
import { Chain, chains, mustFindChain } from '@bubble-tea/base';
import { useCallback } from 'react';

export interface SelectChainProps extends Omit<SelectProps, 'value'> {
  value?: Chain;
  onValueChange?: (chain: Chain) => void;
}

export default function SelectChain({ value, onValueChange, ...props }: SelectChainProps) {
  function renderOption(chain: Chain) {
    return (
      <option key={chain.id} value={chain.id}>
        {chain.name}
      </option>
    );
  }

  return (
    <Select
      {...props}
      value={value?.id}
      onChange={useCallback(e => {
        onValueChange?.(mustFindChain(e.target.value));
        props.onChange?.(e);
      }, [])}
    >
      {chains.map(renderOption)}
    </Select>
  );
}
