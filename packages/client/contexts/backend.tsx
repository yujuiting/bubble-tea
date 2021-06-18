import { createContext, useCallback, useContext } from 'react';
import { NewWallet, Wallet, noop } from '@bubble-tea/base';
import { Backend } from 'services/backend';
import { useDispatch } from 'hooks/store';
import * as walletStore from 'store/wallet';

export interface BackendContext {
  createWallet(newWallet: NewWallet): void;
  destroyWallet(wallet: Wallet): void;
  restore(): void;
}

const Context = createContext<BackendContext>({ createWallet: noop, destroyWallet: noop, restore: noop });

export interface BackendProviderProps {
  backend?: Backend | null;
  children: React.ReactNode;
}

export function BackendProvider({ backend, children }: BackendProviderProps) {
  const dispatch = useDispatch();

  const createWallet = useCallback<BackendContext['createWallet']>(
    async newWallet => {
      if (!backend) return;
      dispatch(walletStore.setSyncing(true));
      try {
        const wallet = await backend.createWallet(newWallet);
        dispatch(walletStore.add(wallet));
      } finally {
        dispatch(walletStore.setSyncing(false));
      }
    },
    [backend],
  );

  const destroyWallet = useCallback<BackendContext['destroyWallet']>(
    async wallet => {
      if (!backend) return;
      dispatch(walletStore.setSyncing(true));
      try {
        if (await backend.destroyWallet(wallet)) {
          dispatch(walletStore.remove(wallet));
        }
      } finally {
        dispatch(walletStore.setSyncing(false));
      }
    },
    [backend],
  );

  const restore = useCallback<BackendContext['restore']>(async () => {
    if (!backend) return;
    dispatch(walletStore.setSyncing(true));
    try {
      const wallets = await backend.fetchWallets('');
      dispatch(walletStore.restore(wallets));
    } finally {
      dispatch(walletStore.setSyncing(false));
    }
  }, [backend]);

  return <Context.Provider value={{ createWallet, destroyWallet, restore }}>{children}</Context.Provider>;
}

export function useBackend() {
  return useContext(Context);
}
