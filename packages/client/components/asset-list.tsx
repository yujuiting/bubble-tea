import {
  isLoadedResource,
  isLoadingResource,
  isPoolAmount,
  loadedResource,
  noopTokenAmount,
  Resource as IResource,
  TokenAmount,
  toNumber,
} from '@bubble-tea/base';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Button, TableProps, useDisclosure } from '@chakra-ui/react';
import { Skeleton } from '@chakra-ui/skeleton';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table';
import { Collapse } from '@chakra-ui/transition';
import DisplayValue from 'components/display-value';
import { useTokenAmountValue } from 'contexts/token-market';
import { useSelector } from 'hooks/store';
import { useMemo } from 'react';
import { selectVsCurrency } from 'store/wallet';

interface Row {
  balance: number;
  value: number;
  amount: TokenAmount;
  isLoading: boolean;
}

const skeletonRow: Row[] = [
  { balance: 123456, value: 123456, amount: noopTokenAmount, isLoading: false },
  { balance: 123456, value: 123456, amount: noopTokenAmount, isLoading: false },
  { balance: 123456, value: 123456, amount: noopTokenAmount, isLoading: false },
];

function toRow(tokenAmount: TokenAmount, resources: Map<TokenAmount, IResource<number>>): Row {
  const resource = resources.get(tokenAmount) || loadedResource(0);
  let isLoading = isLoadingResource(resource);
  let value = isLoadedResource(resource) ? resource.data : 0;
  if (tokenAmount.contains) {
    const containRows = tokenAmount.contains.map(containTokenAmount => toRow(containTokenAmount, resources));
    isLoading = containRows.some(row => row.isLoading);
    value = containRows.reduce((acc, curr) => acc + curr.value, 0);
  }
  return { balance: toNumber(tokenAmount), value, amount: tokenAmount, isLoading };
}

function sortRow(a: Row, b: Row) {
  return (b.value || 0) - (a.value || 0) || b.balance - a.balance;
}

export interface AssetListProps extends TableProps {
  balances?: TokenAmount[];
  isLoading?: boolean;
}

export default function AssetList({ balances = [], isLoading, ...props }: AssetListProps) {
  const allBalances = useMemo(() => {
    const result: TokenAmount[] = [];
    for (const tokenAmount of balances) {
      result.push(tokenAmount);
      if (tokenAmount.contains) result.push(...tokenAmount.contains);
    }
    return result;
  }, [balances]);

  const values = useTokenAmountValue(allBalances);

  const rows = useMemo(() => balances.map(balance => toRow(balance, values)).sort(sortRow), [balances, values]);

  const vsCurrency = useSelector(selectVsCurrency);

  return (
    <Skeleton isLoaded={!isLoading}>
      <Table {...props}>
        <Thead>
          <Tr>
            <Th>Balance</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading && skeletonRow.map((row, index) => <Item key={index} row={row} vsCurrency={vsCurrency} />)}
          {rows.map(row => (
            <Item key={row.amount.token.symbol} row={row} vsCurrency={vsCurrency} />
          ))}
        </Tbody>
      </Table>
    </Skeleton>
  );
}

function Item({ row, vsCurrency }: { row: Row; vsCurrency: string }) {
  const { isOpen, onToggle } = useDisclosure();

  const { balance, value, amount, isLoading } = row;

  const poolAmount = isPoolAmount(amount) ? amount : undefined;

  const values = useTokenAmountValue(poolAmount?.contains || []);

  const rows = useMemo(
    () => poolAmount?.contains.map(balance => toRow(balance, values)).sort(sortRow),
    [poolAmount?.contains, values],
  );

  function renderContains() {
    if (!rows) return;
    return (
      <Table borderLeftWidth={2}>
        <Tbody>
          {rows.map(row => (
            <Item key={row.amount.token.symbol} row={row} vsCurrency={vsCurrency} />
          ))}
        </Tbody>
      </Table>
    );
  }

  function renderBody() {
    if (!rows) return <DisplayValue value={balance} unit={amount.token.symbol} />;
    return (
      <Button marginLeft={-8} display="flex" flexDirection="row" alignItems="center" variant="ghost" onClick={onToggle}>
        <ChevronRightIcon transform={`rotate(${isOpen ? 90 : 0}deg)`} />
        <DisplayValue value={balance} unit={amount.token.symbol} />
      </Button>
    );
  }

  return (
    <Tr key={amount.token.symbol}>
      <Td>
        {renderBody()}
        <Collapse in={isOpen}>{renderContains()}</Collapse>
      </Td>
      <Td>
        <Skeleton isLoaded={!isLoading}>
          <DisplayValue value={value} unit={vsCurrency.toUpperCase()} />
        </Skeleton>
      </Td>
    </Tr>
  );
}
