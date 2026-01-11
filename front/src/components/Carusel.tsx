import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import type { ImageType } from '../types/auth';

interface CarouselProps {
   images: ImageType[];
}

const Carousel = ({ images }: CarouselProps) => {
  if (!images || images.length === 0) return null;

  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={10}
      slidesPerView={1}
      className="w-full h-[400px]"
    >
      {images.map((img) => (
        <SwiperSlide key={img.id}>
          <img
            src={img.id}
            alt="listing"
            className="w-full h-[400px] object-cover rounded-xl"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default Carousel;