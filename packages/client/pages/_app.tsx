import { ChakraProvider } from '@chakra-ui/react';
import { BackendProvider } from 'contexts/backend';
import { TokenMarketProvider } from 'contexts/token-market';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Backend, indexedDBBackend } from 'services/backend';
import store from 'store';
import theme from 'theme';

function MyApp({ Component, pageProps }: AppProps) {
  const [backend, setBackend] = useState<Backend>();
  useEffect(() => setBackend(indexedDBBackend()), []);
  return (
    <Provider store={store}>
      <ChakraProvider resetCSS theme={theme}>
        <BackendProvider backend={backend}>
          <TokenMarketProvider>
            <Component {...pageProps} />
          </TokenMarketProvider>
        </BackendProvider>
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
