import { Text, TextProps } from '@chakra-ui/layout';
import { displayNumber } from 'utils';

export interface DisplayValueProps extends TextProps {
  value?: number;
  options?: Intl.NumberFormatOptions;
  placeholder?: string;
  unit?: React.ReactNode;
}

export default function DisplayValue({
  value = 0,
  options,
  placeholder = `${value}`,
  unit,
  ...props
}: DisplayValueProps) {
  return (
    <Text whiteSpace="nowrap" {...props}>
      {value ? displayNumber(value, options) : placeholder} {unit}
    </Text>
  );
}
