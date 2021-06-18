import { Box, BoxProps } from '@chakra-ui/layout';

export interface ContainerProps extends BoxProps {
  children: React.ReactNode;
}

export default function Container({ children, ...props }: ContainerProps) {
  return (
    <Box borderWidth={1} borderRadius={6} paddingX={4} paddingY={2} {...props}>
      {children}
    </Box>
  );
}
