import React from "react";
import Slider, { type Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface ProductCarouselProps {
  images: string[];
  productName: string;
  onImageClick?: (index: number) => void;
}

const Carousel: React.FC<ProductCarouselProps> = ({
  images,
  productName,
  onImageClick,
}) => {
  const [nav1, setNav1] = React.useState<Slider | null>(null);
  const [nav2, setNav2] = React.useState<Slider | null>(null);

  const mainSettings: Settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: nav2 || undefined,
  
  };

  const thumbnailSettings: Settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    focusOnSelect: true,
    asNavFor: nav1 || undefined,
    
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main slider */}
      <div className="mb-4">
        <Slider {...mainSettings}>
          {images.map((img, index) => (
            <div key={index} className="px-2">
              <div 
                className="relative overflow-hidden rounded-lg cursor-pointer"
                onClick={() => onImageClick && onImageClick(index)}
              >
                <img
                  src={img}
                  alt={`${productName} - ${index + 1}`}
                  className="w-full h-[400px] object-contain bg-gray-100"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Thumbnail slider */}
      {images.length > 1 && (
        <div className="px-8">
          <Slider {...thumbnailSettings}>
            {images.map((img, index) => (
              <div key={index} className="px-1">
                <div className="border-2 border-transparent hover:border-blue-500 rounded overflow-hidden">
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-20 object-cover cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default Carousel;