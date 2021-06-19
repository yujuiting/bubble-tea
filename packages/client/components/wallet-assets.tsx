import { noop, Wallet } from '@bubble-tea/base';
import { IconButton } from '@chakra-ui/button';
import { DeleteIcon } from '@chakra-ui/icons';
import { Spacer, Stack, StackProps } from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/skeleton';
import { Tooltip } from '@chakra-ui/tooltip';
import AssetList from 'components/asset-list';
import DisplayAddress from 'components/display-address';
import DisplayChain from 'components/display-chain';
import DisplayValue from 'components/display-value';
import { useDispatcher, useSelector } from 'hooks/store';
import { useWalletSummary } from 'hooks/use-summary';
import { useEffect } from 'react';
import { useLazyWalletBalancesQuery } from 'store/api';
import { selectVsCurrency, setTokenVisible, UIWallet } from 'store/wallet';

export interface WalletAssetsProps extends StackProps {
  wallet: UIWallet;
  onRemove?: (wallet: Wallet) => void;
}

export default function WalletAssets({ wallet, onRemove = noop, ...props }: WalletAssetsProps) {
  const { chain, address } = wallet;

  const [fetch, { data: balances = [], isLoading }] = useLazyWalletBalancesQuery();

  const vsCurrency = useSelector(selectVsCurrency);

  const [summary, isLoadingSummary] = useWalletSummary(wallet);

  const onChangeTokenVisible = useDispatcher(setTokenVisible);

  useEffect(() => fetch({ chainId: chain.id, address }), [fetch, chain.id, address]);

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
        <Skeleton width="100%" isLoaded={!isLoading}>
          <AssetList
            balances={balances}
            hideTokens={wallet.hideTokens}
            onChangeTokenVisible={(token, visible) => onChangeTokenVisible({ wallet, token, visible })}
          />
        </Skeleton>
      </Stack>
    </Stack>
  );
}
