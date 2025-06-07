import { Header } from "@/components/Header";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Header />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
