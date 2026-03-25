import StocksTable from '../StocksTable';
import { TSX60 } from '../tickers';

export default function TSX60Page() {
  return <StocksTable tickers={TSX60} title="TSX 60" />;
}
