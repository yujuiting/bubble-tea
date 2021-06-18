import { useState } from 'react';
import { Button } from '@chakra-ui/button';
import { Input } from '@chakra-ui/input';
import { Stack, StackProps } from '@chakra-ui/layout';
import { chains, NewWallet } from '@bubble-tea/base';
import { selectUid } from 'store/wallet';
import { useSelector } from 'hooks/store';
import SelectChain from './select-chain';

export interface NewWalletSectionProps extends StackProps {
  onNewWallet: (wallet: NewWallet) => void;
  isLoading?: boolean;
}

export default function NewWalletSection({ onNewWallet, isLoading, ...props }: NewWalletSectionProps) {
  const [chain, setChain] = useState(chains[0]);

  const [address, setAddress] = useState('');

  const belongsTo = useSelector(selectUid);

  function addWallet() {
    onNewWallet({ chain, address, belongsTo });
    setAddress('');
  }

  return (
    <Stack direction="row" {...props}>
      <SelectChain value={chain} onValueChange={setChain} />
      <Input placeholder="Your Address" value={address} onChange={e => setAddress(e.target.value)} />
      <Button onClick={addWallet} isLoading={isLoading} disabled={isLoading || !address}>
        Add
      </Button>
    </Stack>
  );
}
