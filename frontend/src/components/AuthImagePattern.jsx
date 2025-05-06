import { memo } from "react";
import img1 from "../assets/images/img1.webp";
import img2 from "../assets/images/img2.webp";
import img3 from "../assets/images/img3.webp";
import img4 from "../assets/images/img4.webp";
import img5 from "../assets/images/img5.webp";
import img6 from "../assets/images/img6.webp";
import img7 from "../assets/images/img7.webp";
import img8 from "../assets/images/img8.webp";
import img9 from "../assets/images/img9.webp";

// Preload images
const preloadImages = () => {
  const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9];
  images.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

// Call preload on component mount
if (typeof window !== "undefined") {
  preloadImages();
}

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-12 relative overflow-hidden">
      {/* Background pattern - using CSS instead of SVG for better performance */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,#000_1px,transparent_0)] [background-size:40px_40px]"></div>

      <div className="max-w-md text-center relative z-10">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[img1, img2, img3, img4, img5, img6, img7, img8, img9].map(
            (img, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 ${
                  i % 2 === 0 ? "animate-pulse" : ""
                }`}
                style={{
                  willChange: "transform",
                  backfaceVisibility: "hidden",
                }}
              >
                <img
                  src={img}
                  alt={`Pattern ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )
          )}
        </div>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(AuthImagePattern);
