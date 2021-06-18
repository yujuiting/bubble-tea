import { Text, TextProps } from '@chakra-ui/layout';
import { Chain } from '@bubble-tea/base';

export interface DisplayChainProps extends TextProps {
  chain: Chain;
}

export default function DisplayChain({ chain, ...props }: DisplayChainProps) {
  return <Text {...props}>{chain.name}</Text>;
}
