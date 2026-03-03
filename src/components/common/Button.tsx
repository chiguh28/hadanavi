import Link from "next/link";
import type { ComponentProps } from "react";

const variantStyles = {
  primary:
    "bg-primary text-white hover:opacity-90",
  secondary:
    "bg-secondary text-white hover:opacity-90",
  outline:
    "border-2 border-primary text-primary hover:bg-primary-light",
} as const;

const sizeStyles = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2 text-sm",
  lg: "px-8 py-3 text-lg",
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type ButtonAsButton = ComponentProps<"button"> & {
  href?: undefined;
};

type ButtonAsLink = ComponentProps<typeof Link> & {
  href: string;
};

type ButtonProps = (ButtonAsButton | ButtonAsLink) & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-all";
  const classes =
    `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim();

  if ("href" in props && props.href !== undefined) {
    const { ...linkProps } = props as ButtonAsLink;
    return <Link className={classes} {...linkProps} />;
  }

  const { ...buttonProps } = props as ButtonAsButton;
  return <button className={classes} {...buttonProps} />;
}
