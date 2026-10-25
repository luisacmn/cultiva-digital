import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-8">
      <Logo />
      <div className="flex flex-1 flex-col justify-center py-10">{children}</div>
    </main>
  );
}
