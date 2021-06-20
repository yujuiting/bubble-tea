import {
  cacheKey,
  isLoadedResource,
  isLoadingResource,
  isPoolAmount,
  isStakedAmount,
  loadedResource,
  noop,
  Resource as IResource,
  Token,
  TokenAmount,
  toNumber,
} from '@bubble-tea/base';
import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Button,
  Icon,
  IconButton,
  Link,
  Stat,
  StatHelpText,
  StatNumber,
  TableProps,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { Skeleton } from '@chakra-ui/skeleton';
import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table';
import { Collapse } from '@chakra-ui/transition';
import DisplayValue from 'components/display-value';
import { useTokenAmountValue } from 'contexts/token-market';
import { useSelector } from 'hooks/store';
import { useTokenAmountIncludeContains } from 'hooks/use-token-amounts';
import { useMemo } from 'react';
import { FaEye, FaEyeSlash, FaExternalLinkAlt } from 'react-icons/fa';
import { selectVsCurrency } from 'store/wallet';
import { displayNumber } from 'utils';

interface Row {
  balance: number;
  value: number;
  rewardValue: number;
  amount: TokenAmount;
  isLoading: boolean;
}

function toRow(tokenAmount: TokenAmount, resources: Map<TokenAmount, IResource<number>>): Row {
  const resource = resources.get(tokenAmount) || loadedResource(0);
  let isLoading = isLoadingResource(resource);
  let value = isLoadedResource(resource) ? resource.data : 0;
  let rewardValue = 0;
  if (tokenAmount.contains) {
    const containRows: Row[] = [];
    const rewardRows: Row[] = [];
    for (const contain of tokenAmount.contains) {
      if (contain.isReward) rewardRows.push(toRow(contain, resources));
      containRows.push(toRow(contain, resources));
    }
    isLoading = [...containRows, ...rewardRows].some(row => row.isLoading);
    rewardValue += rewardRows.reduce((acc, curr) => acc + curr.value, 0);
    value += containRows.reduce((acc, curr) => acc + curr.value, 0) + rewardValue;
  }
  return { balance: toNumber(tokenAmount), value, rewardValue, amount: tokenAmount, isLoading };
}

function sortRow(a: Row, b: Row) {
  return (b.value || 0) - (a.value || 0) || b.balance - a.balance;
}

export interface AssetListProps extends TableProps {
  balances?: TokenAmount[];
  onChangeTokenVisible?: (token: Token, visible: boolean) => void;
  hideTokens?: string[];
  hideChangeVisibleButton?: boolean;
  hideGoToButton?: boolean;
}

export default function AssetList({
  balances = [],
  hideTokens = [],
  onChangeTokenVisible = noop,
  hideChangeVisibleButton = false,
  hideGoToButton = false,
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
          {!hideChangeVisibleButton && <Th>{renderToggleVisible()}</Th>}
          {!hideGoToButton && <Th />}
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
            hideChangeVisibleButton={hideChangeVisibleButton}
            hideGoToButton={hideGoToButton}
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
  hideChangeVisibleButton?: boolean;
  hideGoToButton?: boolean;
}

function Item({
  row,
  vsCurrency,
  visible = true,
  onChangeTokenVisible = noop,
  hideChangeVisibleButton = false,
  hideGoToButton = false,
}: ItemProps) {
  const { isOpen, onToggle } = useDisclosure();

  const { balance, value, rewardValue, amount, isLoading } = row;

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
            <Item
              key={row.amount.token.symbol}
              row={row}
              vsCurrency={vsCurrency}
              hideChangeVisibleButton
              hideGoToButton
            />
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
          <Stat>
            <StatNumber>
              {displayNumber(value)} {vsCurrency.toUpperCase()}
            </StatNumber>
            {rewardValue > 0 && (
              <StatHelpText marginBottom={0}>
                Unclaimed {displayNumber(rewardValue)} {vsCurrency.toUpperCase()}
              </StatHelpText>
            )}
          </Stat>
        </Skeleton>
      </Td>
      {!hideChangeVisibleButton && (
        <Td>
          <Tooltip label="Toggle visible on charts">
            <IconButton
              variant="ghost"
              aria-label="toggle visible"
              icon={<Icon as={visible ? FaEye : FaEyeSlash} />}
              onClick={() => onChangeTokenVisible(amount.token, !visible)}
            />
          </Tooltip>
        </Td>
      )}
      {!hideGoToButton && (
        <Td>
          {amount.located?.url && (
            <Tooltip label={`Go to ${amount.located.name}`}>
              <Link href={amount.located.url} target="_blank">
                <Icon as={FaExternalLinkAlt} />
              </Link>
            </Tooltip>
          )}
        </Td>
      )}
    </Tr>
  );
}
