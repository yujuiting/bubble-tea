import React from 'react';
import { Grid, HStack, Link } from '@chakra-ui/react';

export interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const headerChildren: React.ReactNode[] = [];
  const footerChildren: React.ReactNode[] = [];
  const restChildren: React.ReactNode[] = [];

  React.Children.forEach(children, child => {
    if (!React.isValidElement(child)) {
      restChildren.push(child);
      return;
    }
    if (child.type === Header) {
      headerChildren.push(child);
      return;
    }
    if (child.type === Footer) {
      footerChildren.push(child);
      return;
    }
    restChildren.push(child);
  });

  return (
    <Grid templateRows="40px auto 40px" gap={3} padding={3} height="100vh" overflow="hidden">
      <HStack>{headerChildren}</HStack>
      {restChildren}
      <HStack justifyContent="center" alignItems="center" width="100%" height="100%">
        {footerChildren}
      </HStack>
    </Grid>
  );
}

export function Header({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Footer({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
