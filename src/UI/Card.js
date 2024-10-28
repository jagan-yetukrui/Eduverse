import React from "react";
import classNames from "classnames";

// Card Component
const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={classNames("rounded-lg border bg-white text-gray-800 shadow-sm", className)}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = "Card";

// CardHeader Component
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={classNames("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

// CardTitle Component
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={classNames("text-2xl font-semibold leading-none", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

// CardDescription Component
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={classNames("text-sm text-gray-500", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

// CardContent Component
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={classNames("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// CardFooter Component
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={classNames("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
