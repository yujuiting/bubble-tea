import { IconButton, useColorModeValue, Link } from '@chakra-ui/react';
import Image from 'next/image';

export default function GitHubButton() {
  const image = useColorModeValue('/assets/GitHub-Mark-64px.png', '/assets/GitHub-Mark-Light-64px.png');
  return (
    <Link href="https://github.com/yujuiting/bubble-tea" target="_blank">
      <IconButton aria-label="Github project" icon={<Image src={image} layout="fill" />} />
    </Link>
  );
}
