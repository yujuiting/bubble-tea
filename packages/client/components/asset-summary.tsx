import { Skeleton } from '@chakra-ui/skeleton';
import { Text } from '@chakra-ui/layout';
import { displayNumber } from 'utils';
import { selectVsCurrency } from 'store/wallet';
import { useAllSummary } from 'hooks/useSummary';
import { useSelector } from 'hooks/store';

export default function AssetSummary() {
  const [summary, isLoading] = useAllSummary();

  const vsCurrency = useSelector(selectVsCurrency);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Text>
        {displayNumber(summary)} {vsCurrency.toUpperCase()}
      </Text>
    </Skeleton>
  );
}
