// Use skeletons for page-level data fetches, spinners for button work, and nothing for sub-100ms transitions.
import clsx from "clsx";
import { CSSProperties } from "react";

type SkeletonProps = {
  className?: string;
  h?: number | string;
  w?: number | string;
};

export default function Skeleton({ className, h, w }: SkeletonProps) {
  const style: CSSProperties = {
    height: h,
    width: w,
  };

  return <div className={clsx("animate-pulse rounded bg-surface-panel", className)} style={style} />;
}
