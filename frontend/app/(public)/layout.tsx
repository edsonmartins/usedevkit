export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-terminal-bg flex items-center justify-center p-4">
      {children}
    </div>
  );
}
