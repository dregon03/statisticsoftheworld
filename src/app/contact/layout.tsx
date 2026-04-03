import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Statistics of the World team. Questions about the API, data coverage, partnerships, or billing.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
