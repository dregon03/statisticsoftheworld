import StocksTable from '../StocksTable';
import { SP500 } from '../tickers';

export default function SP500Page() {
  return <StocksTable tickers={SP500} title="S&P 500" />;
}
