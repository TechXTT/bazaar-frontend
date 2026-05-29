import { CONFIG } from "@/config/config";

const BucketImage = ({
  className,
  imageURL,
  name,
}: {
  className: string;
  imageURL: string;
  name: string;
}) => {
  const src = imageURL
    ? `${CONFIG.CDN_BASE_URL}/${imageURL}`
    : "";

  return <img src={src} alt={name} className={className} />;
};

export default BucketImage;
