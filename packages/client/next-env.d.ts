/// <reference types="next" />
/// <reference types="next/types/global" />

declare interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof import('redux').compose;
  __REDUX_DEVTOOLS_EXTENSION__: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
