const Skeleton = ({ h }: { h: number }) => (
  <div
    className="animate-pulse rounded-xl bg-bg-secondary"
    style={{ height: h }}
  />
);

export default Skeleton;
