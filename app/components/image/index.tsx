"use client";

import { CONFIG } from "@/config/config";
import { useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";

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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!src) return;
    const img = new window.Image();
    img.onload = () => setReady(true);
    img.onerror = () => setReady(false);
    img.src = src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-surface-sunken ${className}`}>
      {ready ? (
        <img
          src={src}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
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
