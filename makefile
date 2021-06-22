clean:
	rm -rf packages/**/dist/*

build-packages:
	yarn workspace @bubble-tea/base build && \
	yarn workspace @bubble-tea/isomorphic-fetch build && \
	yarn workspace @bubble-tea/bscscan build && \
	yarn workspace @bubble-tea/etherscan build && \
	yarn workspace @bubble-tea/coin-gecko build && \
	yarn workspace @bubble-tea/binance-smart-chain build && \
	yarn workspace @bubble-tea/ethereum build && \
	yarn workspace @bubble-tea/solana build && \
	yarn workspace @bubble-tea/beefy.finance build && \
	yarn workspace @bubble-tea/convexfinance.com build && \
	yarn workspace @bubble-tea/network-provider build && \
	yarn workspace @bubble-tea/server build

dev-client:
	yarn workspace @bubble-tea/client dev

dev-server:
	yarn workspace @bubble-tea/server dev

build-client: build-packages
	yarn workspace @bubble-tea/client build

build-server:
	yarn workspace @bubble-tea/server build

take-all-snapshot: 
	node -r dotenv/config packages/server/dist/scripts/take-all-snapshot.js