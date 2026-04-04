import CurrencyPairContent from './CurrencyPairContent';

export default function CurrencyPairPage({ params }: { params: Promise<{ pair: string }> }) {
  return <CurrencyPairContent params={params} />;
}
