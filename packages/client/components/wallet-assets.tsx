import { noop, Wallet } from '@bubble-tea/base';
import { Stack, StackProps, Spacer } from '@chakra-ui/layout';
import { IconButton } from '@chakra-ui/button';
import { Tooltip } from '@chakra-ui/tooltip';
import { DeleteIcon } from '@chakra-ui/icons';
import { Skeleton } from '@chakra-ui/skeleton';
import AssetList from 'components/asset-list';
import DisplayAddress from 'components/display-address';
import DisplayChain from 'components/display-chain';
import DisplayValue from 'components/display-value';
import { useSelector } from 'hooks/store';
import { useWalletSummary } from 'hooks/useSummary';
import { useEffect } from 'react';
import { useLazyWalletBalancesQuery } from 'store/api';
import { selectVsCurrency } from 'store/wallet';

export interface WalletAssetsProps extends StackProps {
  wallet: Wallet;
  onRemove?: (wallet: Wallet) => void;
}

export default function WalletAssets({ wallet, onRemove = noop, ...props }: WalletAssetsProps) {
  const { chain, address } = wallet;

  const [fetch, { data: balances = [], isLoading }] = useLazyWalletBalancesQuery();

  const vsCurrency = useSelector(selectVsCurrency);

  const [summary, isLoadingSummary] = useWalletSummary(wallet);

  useEffect(() => fetch(wallet), [fetch, wallet]);

  return (
    <Stack direction="column" {...props}>
      <Stack direction="row" alignItems="center">
        <DisplayChain chain={chain} />
        <DisplayAddress address={address} />
        <Spacer />
        <Skeleton isLoaded={!isLoadingSummary}>
          <DisplayValue value={summary} unit={vsCurrency.toUpperCase()} />
        </Skeleton>
        <Tooltip label="Remove wallet">
          <IconButton
            variant="outline"
            aria-label="remove wallet"
            icon={<DeleteIcon />}
            onClick={() => onRemove(wallet)}
          />
        </Tooltip>
      </Stack>
      <Stack direction="row" flexGrow={1}>
        <AssetList balances={balances} isLoading={isLoading} width="30%" />
      </Stack>
    </Stack>
  );
}
