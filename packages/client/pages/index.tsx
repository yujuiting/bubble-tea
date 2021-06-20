import { Wallet } from '@bubble-tea/base';
import { AspectRatio, Spacer, Stack, Text } from '@chakra-ui/layout';
import { Skeleton } from '@chakra-ui/react';
import AssetList from 'components/asset-list';
import AssetSummary from 'components/asset-summary';
import BscscanLink from 'components/bscscan-link';
import CoinGeckoLink from 'components/coin-gecko-link';
import Container from 'components/container';
import DarkModeSwitch from 'components/dark-mode-switch';
import EtherscanLink from 'components/etherscan-link';
import GitHubButton from 'components/github-button';
import Layout, { Footer, Header } from 'components/layout';
import NewWalletSection from 'components/new-wallet-section';
import SelectVsCurrency from 'components/select-vs-currency';
import TokenAmountPie from 'components/token-amount-pie';
import WalletAssets from 'components/wallet-assets';
import { useBackend } from 'contexts/backend';
import { useDispatcher, useSelector } from 'hooks/store';
import { useVisibleTokenAmounts } from 'hooks/use-token-amounts';
import { useEffect } from 'react';
import * as wallet from 'store/wallet';

export default function Index() {
  const vsCurrency = useSelector(wallet.selectVsCurrency);

  const wallets = useSelector(wallet.selectWallets);

  const setVsCurrency = useDispatcher(wallet.setVsCurrency);

  const [tokenAmounts, isLoading] = useVisibleTokenAmounts();

  const { createWallet, destroyWallet, restore } = useBackend();

  useEffect(() => restore(), [restore]);

  function renderWallet(wallet: Wallet) {
    return (
      <Container key={`${wallet.chain.id}-${wallet.address}`}>
        <WalletAssets wallet={wallet} onRemove={destroyWallet} />
      </Container>
    );
  }

  return (
    <Layout>
      <Header>
        <NewWalletSection onNewWallet={createWallet} />
        <Spacer />
        <SelectVsCurrency value={vsCurrency} onValueChange={setVsCurrency} />
        <DarkModeSwitch />
        <GitHubButton />
      </Header>
      <Stack direction="row" height="100%" overflow="hidden">
        <Stack direction="column" height="100%" overflow="auto">
          {wallets.map(renderWallet)}
        </Stack>
        <Stack direction="column" flexGrow={1}>
          <Container>
            <Stack direction="row">
              <Spacer />
              <Text>Summary</Text>
              <AssetSummary />
            </Stack>
          </Container>
          <Container flexGrow={1} overflow="auto">
            <Skeleton isLoaded={!isLoading}>
              <AssetList balances={tokenAmounts} hideChangeVisibleButton hideGoToButton />
            </Skeleton>
          </Container>
          <Container height="70%">
            <AspectRatio width="100%" ratio={1.6}>
              <TokenAmountPie tokenAmounts={tokenAmounts} />
            </AspectRatio>
          </Container>
        </Stack>
      </Stack>
      <Footer>
        <Stack direction="row" spacing={8} alignItems="center">
          <Text>Date source</Text>
          <CoinGeckoLink />
          <EtherscanLink />
          <BscscanLink />
        </Stack>
      </Footer>
    </Layout>
  );
}
