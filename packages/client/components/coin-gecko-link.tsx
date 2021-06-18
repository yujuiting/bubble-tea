import { Link, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';

export default function CoinGeckoLink() {
  const image = useColorModeValue('/assets/coingecko.svg', '/assets/CoinGecko-WhiteText.svg');
  return (
    <Link href="https://www.coingecko.com/" target="_blank" height="32px">
      <Image src={image} width="120px" height="32px" />
    </Link>
  );
}
