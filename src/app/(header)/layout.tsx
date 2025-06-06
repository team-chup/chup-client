import { Header } from "@/components/Header";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}