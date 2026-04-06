'use client';

import dynamic from 'next/dynamic';

const AskSOTW = dynamic(() => import('./AskSOTW'), {
  ssr: false,
  loading: () => null,
});

export default function LazyAskSOTW() {
  return <AskSOTW />;
}
