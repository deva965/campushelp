import { AppShell } from "@/components/shared/AppShell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell role="student">{children}</AppShell>;
}
