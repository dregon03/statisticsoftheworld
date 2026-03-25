import StocksTable from '../StocksTable';
import { NASDAQ100 } from '../tickers';

export default function Nasdaq100Page() {
  return <StocksTable tickers={NASDAQ100} title="Nasdaq 100" />;
}
