import { Wallet } from '@bubble-tea/base';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from 'store';

interface State {
  uid: string;
  wallets: Wallet[];
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
      const index = state.wallets.indexOf(action.payload);
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
  },
});

export const { add, remove, setVsCurrency, setSyncing, restore } = slice.actions;

export const selectUid = (state: RootState) => state.wallet.uid;

export const selectWallets = (state: RootState) => state.wallet.wallets;

export const selectVsCurrency = (state: RootState) => state.wallet.vsCurrency;

export const selectSyncing = (state: RootState) => state.wallet.syncing;

export default slice.reducer;
