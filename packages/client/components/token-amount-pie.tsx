import { isLoadedResource, loadedResource, Resource, TokenAmount } from '@bubble-tea/base';
import { useColorModeValue } from '@chakra-ui/react';
import { Stat, StatLabel, StatNumber } from '@chakra-ui/stat';
import { PieTooltipProps, ResponsivePie } from '@nivo/pie';
import { useTokenAmountValue } from 'contexts/token-market';
import { useTokenAmountIncludeContains } from 'hooks/use-token-amounts';
import { useMemo } from 'react';
import { displayNumber } from 'utils';

function toData(tokenAmount: TokenAmount, resources: Map<TokenAmount, Resource<number>>) {
  const resource = resources.get(tokenAmount) || loadedResource(0);
  let value = isLoadedResource(resource) ? resource.data : 0;
  if (tokenAmount.contains) {
    const containRows = tokenAmount.contains.map(containTokenAmount => toData(containTokenAmount, resources));
    value = containRows.reduce((acc, curr) => acc + curr.value, 0);
  }
  return { id: tokenAmount.token.symbol, label: tokenAmount.token.name, value };
}

export interface TokenAmountPieProps {
  tokenAmounts: TokenAmount[];
}

export default function TokenAmountPie({ tokenAmounts }: TokenAmountPieProps) {
  const allTokenAmounts = useTokenAmountIncludeContains(tokenAmounts);

  const values = useTokenAmountValue(allTokenAmounts);

  const data = useMemo(() => tokenAmounts.map(tokenAmount => toData(tokenAmount, values)), [tokenAmounts, values]);

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={useColorModeValue('var(--chakra-colors-gray-900)', 'var(--chakra-colors-gray-100)')}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      arcLabel={d => displayNumber(d.value)}
      tooltip={Tooltip}
      legends={[
        {
          anchor: 'right',
          direction: 'column',
          justify: false,
          translateX: 0,
          translateY: 0,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 24,
          itemTextColor: '#999',
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: 'circle',
          effects: [{ on: 'hover', style: { itemTextColor: '#000' } }],
        },
      ]}
    />
  );
}

function Tooltip({ datum: { label, value } }: PieTooltipProps<any>) {
  return (
    <Stat backgroundColor={useColorModeValue('gray.300', 'gray.700')} paddingX={4} paddingY={2} borderRadius={6}>
      <StatLabel>{label}</StatLabel>
      <StatNumber>{value}</StatNumber>
    </Stat>
  );
}
