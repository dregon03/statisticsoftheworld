import { redirect } from 'next/navigation';

export default function StocksPage() {
  redirect('/markets/stocks/sp500');
}
