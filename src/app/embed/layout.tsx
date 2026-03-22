export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  // Minimal layout for embeds — no Nav, no Footer
  return <>{children}</>;
}
