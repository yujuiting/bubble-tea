import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import wallet from './wallet';
import api from './api';

const store = configureStore({
  reducer: {
    wallet,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(api.middleware),
});

export default store;

export type RootState = ReturnType<typeof store.getState>;

export type Dispatcher = typeof store.dispatch;

setupListeners(store.dispatch);
