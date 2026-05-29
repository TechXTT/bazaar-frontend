import { HTMLAttributes } from "react";

const Card = ({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-xl border border-border-subtle bg-bg-secondary ${className}`}
    {...props}
  >
    {children}
  </div>
);

export default Card;
