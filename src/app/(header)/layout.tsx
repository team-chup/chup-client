import { Header } from "@/components/Header";

export default function HeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      {children}
    </div>
  );
}