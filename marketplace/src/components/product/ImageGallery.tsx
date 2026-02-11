"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const displayImages = images.length > 0 ? images : ["/placeholder.svg"];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={displayImages[selectedIndex]}
          alt={alt}
          width={600}
          height={600}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                selectedIndex === index ? "border-gray-900" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={image}
                alt={`${alt} ${index + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
