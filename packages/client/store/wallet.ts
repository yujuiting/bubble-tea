import { cacheKey, Token, Wallet } from '@bubble-tea/base';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

export interface UIWallet extends Wallet {
  /**
   * cacheKey(token.symbol, token.name);
   */
  hideTokens?: string[];
}

interface State {
  uid: string;
  wallets: UIWallet[];
  vsCurrency: string;
  syncing: boolean;
}

const initialState: State = {
  uid: '',
  wallets: [],
  vsCurrency: 'usd',
  syncing: false,
};

const slice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    add: (state, action: PayloadAction<Wallet>) => {
      state.wallets.push(action.payload);
    },
    remove: (state, action: PayloadAction<Wallet>) => {
      const index = state.wallets.findIndex(wallet => wallet.id === action.payload.id);
      state.wallets.splice(index, 1);
    },
    restore: (state, action: PayloadAction<Wallet[]>) => {
      state.wallets = action.payload;
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
    setVsCurrency: (state, action: PayloadAction<string>) => {
      state.vsCurrency = action.payload;
    },
    setUid: (state, action: PayloadAction<string>) => {
      state.uid = action.payload;
    },
    setTokenVisible: (state, action: PayloadAction<{ wallet: Wallet; token: Token; visible: boolean }>) => {
      const wallet = state.wallets.find(wallet => wallet.id === action.payload.wallet.id);
      if (!wallet) return;
      const key = cacheKey(action.payload.token.symbol, action.payload.token.name);
      wallet.hideTokens = wallet.hideTokens || [];
      if (action.payload.visible) {
        const keyIndex = wallet.hideTokens.indexOf(key);
        if (keyIndex !== -1) wallet.hideTokens.splice(keyIndex, 1);
      } else {
        wallet.hideTokens.push(key);
      }
    },
  },
});

export const { add, remove, setVsCurrency, setSyncing, restore, setTokenVisible } = slice.actions;

export const selectUid = (state: RootState) => state.wallet.uid;

export const selectWallets = (state: RootState) => state.wallet.wallets;

export const selectVsCurrency = (state: RootState) => state.wallet.vsCurrency;

export const selectSyncing = (state: RootState) => state.wallet.syncing;

export default slice.reducer;
