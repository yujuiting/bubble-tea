import { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider } from 'react-redux';
import theme from 'theme';
import store from 'store';
import { BackendProvider } from 'contexts/backend';
import { TokenMarketProvider } from 'contexts/token-market';
import { Backend, indexedDBBackend } from 'services/backend';
import { useEffect, useState } from 'react';

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
