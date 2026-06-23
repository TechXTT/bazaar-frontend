"use client";

import { CONFIG } from "@/config/config";
import Image from "next/image";
import { useState } from "react";
import { FiImage } from "react-icons/fi";

// FE-7: render product images through next/image (optimized, lazy, CDN-whitelisted
// in next.config.js) instead of a raw <img> + manual preloader. Falls back to a
// placeholder icon when there's no image or it fails to load.
const BucketImage = ({
  className,
  imageURL,
  name,
}: {
  className: string;
  imageURL: string;
  name: string;
}) => {
  const src = imageURL ? `${CONFIG.CDN_BASE_URL}/${imageURL}` : "";
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-surface-sunken ${className}`}>
      {src && !errored ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <FiImage size={36} className="text-text-muted" />
        </div>
      )}
    </div>
  );
};

export default BucketImage;
