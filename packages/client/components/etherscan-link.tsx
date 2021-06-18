import { Link, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';

export default function Etherscan() {
  const image = useColorModeValue('/assets/etherscan-logo.svg', '/assets/etherscan-logo-light.svg');
  return (
    <Link href="https://etherscan.io/" target="_blank" height="32px">
      <Image src={image} width="143px" height="32px" />
    </Link>
  );
}
