import { useColorMode, IconButton, ColorMode, ComponentWithAs, IconProps } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const colorModeToIcon: Record<ColorMode, ComponentWithAs<'svg', IconProps>> = {
  light: MoonIcon,
  dark: SunIcon,
};

export default function DarkModeSwitch() {
  const { colorMode, toggleColorMode } = useColorMode();
  const Icon = colorModeToIcon[colorMode];
  return <IconButton aria-label="switch dark mode" icon={<Icon />} onClick={toggleColorMode} />;
}
