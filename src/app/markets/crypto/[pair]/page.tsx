import CryptoPairContent from './CryptoPairContent';

export default function CryptoPairPage({ params }: { params: Promise<{ pair: string }> }) {
  return <CryptoPairContent params={params} />;
}
