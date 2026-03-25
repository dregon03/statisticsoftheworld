import StocksTable from '../StocksTable';
import { FTSE100 } from '../tickers';

export default function FTSE100Page() {
  return <StocksTable tickers={FTSE100} title="FTSE 100" />;
}
