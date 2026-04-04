import StockContent from './StockContent';

export default function StockPage({ params }: { params: Promise<{ ticker: string }> }) {
  return <StockContent params={params} />;
}
