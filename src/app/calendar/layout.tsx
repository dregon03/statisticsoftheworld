import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Data Release Calendar — International Organization Publications',
  description: 'Track when IMF, World Bank, UN, ILO, WHO, and central banks publish updated economic data. Release schedules for WEO, WDI, jobs reports, CPI, and more.',
  openGraph: {
    title: 'Data Release Calendar — Statistics of the World',
    description: 'Track major international data publication schedules.',
  },
};

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
