import { Link, useColorModeValue } from '@chakra-ui/react';
import Image from 'next/image';

export default function Bscscan() {
  const image = useColorModeValue('/assets/bscscan-logo.svg', '/assets/bscscan-logo-light.svg');
  return (
    <Link href="https://bscscan.com/" target="_blank" height="32px">
      <Image src={image} width="125px" height="32px" />
    </Link>
  );
}
