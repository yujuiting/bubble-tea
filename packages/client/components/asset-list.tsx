import {
  cacheKey,
  isLoadedResource,
  isLoadingResource,
  isPoolAmount,
  loadedResource,
  noop,
  Resource as IResource,
  Token,
  TokenAmount,
  toNumber,
} from '@bubble-tea/base';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Button, Icon, IconButton, TableProps, Tooltip, useDisclosure } from '@chakra-ui/react';
import { Skeleton } from '@chakra-ui/skeleton';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table';
import { Collapse } from '@chakra-ui/transition';
import DisplayValue from 'components/display-value';
import { useTokenAmountValue } from 'contexts/token-market';
import { useSelector } from 'hooks/store';
import { useTokenAmountIncludeContains } from 'hooks/use-token-amounts';
import { useMemo } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { selectVsCurrency } from 'store/wallet';

interface Row {
  balance: number;
  value: number;
  amount: TokenAmount;
  isLoading: boolean;
}

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
  onChangeTokenVisible?: (token: Token, visible: boolean) => void;
  hideTokens?: string[];
  hideToggleVisibleButton?: boolean;
}

export default function AssetList({
  balances = [],
  hideTokens = [],
  onChangeTokenVisible = noop,
  hideToggleVisibleButton = false,
  ...props
}: AssetListProps) {
  const allBalances = useTokenAmountIncludeContains(balances);

  const values = useTokenAmountValue(allBalances);

  const rows = useMemo(() => balances.map(balance => toRow(balance, values)).sort(sortRow), [balances, values]);

  const vsCurrency = useSelector(selectVsCurrency);

  const hasHiddenTokens = hideTokens.length > 0;

  function renderToggleVisible() {
    return (
      <Tooltip label="Toggle visible on charts">
        <IconButton
          variant="ghost"
          aria-label="toggle visible"
          icon={<Icon as={hasHiddenTokens ? FaEyeSlash : FaEye} />}
          onClick={() => balances.forEach(({ token }) => onChangeTokenVisible(token, hasHiddenTokens))}
        />
      </Tooltip>
    );
  }

  return (
    <Table {...props}>
      <Thead>
        <Tr>
          <Th>Balance</Th>
          <Th>Value</Th>
          <Th>{renderToggleVisible()}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map(row => (
          <Item
            key={row.amount.token.symbol}
            row={row}
            vsCurrency={vsCurrency}
            visible={!hideTokens.includes(cacheKey(row.amount.token.symbol, row.amount.token.name))}
            onChangeTokenVisible={onChangeTokenVisible}
            hideToggleVisibleButton={hideToggleVisibleButton}
          />
        ))}
      </Tbody>
    </Table>
  );
}

interface ItemProps {
  row: Row;
  vsCurrency: string;
  visible?: boolean;
  onChangeTokenVisible?: (token: Token, visible: boolean) => void;
  hideToggleVisibleButton?: boolean;
}

function Item({
  row,
  vsCurrency,
  visible = true,
  onChangeTokenVisible = noop,
  hideToggleVisibleButton = false,
}: ItemProps) {
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
      <Td>
        {!hideToggleVisibleButton && (
          <Tooltip label="Toggle visible on charts">
            <IconButton
              variant="ghost"
              aria-label="toggle visible"
              icon={<Icon as={visible ? FaEye : FaEyeSlash} />}
              onClick={() => onChangeTokenVisible(amount.token, !visible)}
            />
          </Tooltip>
        )}
      </Td>
    </Tr>
  );
}
