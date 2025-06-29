import React from "react";
import classNames from "classnames";

// Define the button variants
const buttonVariants = (variant = "default", size = "default") => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    default: "bg-blue-500 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-500",
    outline: "border border-gray-300 bg-white hover:bg-gray-100",
    secondary: "bg-gray-600 text-white hover:bg-gray-500",
    ghost: "hover:bg-gray-200 text-gray-800",
    link: "text-blue-600 underline-offset-4 hover:underline",
  };

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return classNames(baseClasses, variantClasses[variant], sizeClasses[size]);
};

// Button component
const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <button className={classNames(buttonVariants(variant, size), className)} ref={ref} {...props} />
));

Button.displayName = "Button";

export { Button };
