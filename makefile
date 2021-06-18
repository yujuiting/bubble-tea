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
	yarn workspace @bubble-tea/network-provider build && \
	yarn workspace @bubble-tea/beefy.finance build

dev:
	yarn workspace @bubble-tea/client dev

build: build-packages
	yarn workspace @bubble-tea/client build