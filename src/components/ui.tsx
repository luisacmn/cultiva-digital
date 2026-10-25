import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary: "bg-moss text-white hover:bg-moss-dark",
  secondary: "border border-line bg-surface text-ink hover:border-moss/40",
  ghost: "text-moss hover:bg-leaf",
  danger: "border border-clay/30 bg-surface text-clay hover:bg-clay-soft",
};

export function buttonClass(variant: Variant = "primary", extra = "") {
  return `inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

const fieldBase =
  "w-full rounded-2xl border border-line bg-surface px-4 text-base text-ink placeholder:text-muted/70 outline-none transition focus:border-moss focus:ring-4 focus:ring-leaf";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${fieldBase} h-12 ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${fieldBase} min-h-28 py-3 ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${fieldBase} h-12 appearance-none ${className}`} {...props} />;
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: ReactNode;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function FormMessage({ state }: { state?: { error?: string; message?: string } }) {
  if (state?.error) {
    return (
      <p role="alert" className="rounded-2xl bg-clay-soft px-4 py-3 text-sm text-clay">
        {state.error}
      </p>
    );
  }
  if (state?.message) {
    return (
      <p role="status" className="rounded-2xl bg-leaf px-4 py-3 text-sm text-moss-dark">
        {state.message}
      </p>
    );
  }
  return null;
}

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-card border border-line bg-surface ${className}`} {...props} />;
}
