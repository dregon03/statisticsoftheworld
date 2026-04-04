import CommodityContent from './CommodityContent';

export default function CommodityPage({ params }: { params: Promise<{ slug: string }> }) {
  return <CommodityContent params={params} />;
}
