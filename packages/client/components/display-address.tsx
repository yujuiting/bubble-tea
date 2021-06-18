import { Button, ButtonProps } from '@chakra-ui/button';
import { CopyIcon } from '@chakra-ui/icons';
import { Address } from '@bubble-tea/base';
import { copyText } from 'utils';

export interface DisplayAddressProps extends ButtonProps {
  address: Address;
  head?: number;
  tail?: number;
}

export default function DisplayAddress({ address, head = 8, tail = 6, ...props }: DisplayAddressProps) {
  return (
    <Button variant="ghost" rightIcon={<CopyIcon />} onClick={() => copyText(address)} {...props}>
      {address.slice(0, head)}...{address.slice(-tail)}
    </Button>
  );
}
