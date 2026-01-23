import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import styled from "styled-components";

import 배너1 from "../../assets/banner/포스터1.webp";
import 배너3 from "../../assets/banner/포스터3.webp";

import "swiper/css";
import "swiper/css/pagination";

export default function HomeBanner() {
  return (
    <BannerWrapper>
      <Swiper
        pagination={{ clickable: true }}
        modules={[Pagination, Autoplay]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={true}
        className="home-swiper"
      >
        {/* 슬라이드 구조 유지 */}
        <SwiperSlide>
          <img className="banner-img" src={배너3} alt="배너 이미지 3" />
        </SwiperSlide>
        <SwiperSlide>
          <img className="banner-img" src={배너1} alt="배너 이미지 1" />
        </SwiperSlide>
      </Swiper>
    </BannerWrapper>
  );
}

const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto; /* PC 환경 중앙 정렬 */

  .home-swiper {
    width: 100%;
    height: 250px;

    /* PC 환경 높이 보정 */
    @media (min-width: 1024px) {
      height: 450px;
    }
  }

  .swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  .banner-img {
    width: 100%;
    height: 250px; /* 기본 높이 */
    object-fit: cover;
    cursor: pointer;

    /* PC 환경 이미지 높이 보정 */
    @media (min-width: 1024px) {
      height: 450px;
    }
  }

  .swiper-pagination {
    bottom: 12px !important;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 16px;
    box-sizing: border-box;
  }

  .swiper-pagination-bullet {
    height: 3px;
    background-color: #ccc;
    opacity: 1;
    border-radius: 2px;
    flex: 1;
    margin: 0 3px !important;
    transition: background-color 0.3s ease;

    /* PC에서 인디케이터가 너무 길어지는 것 방지 */
    @media (min-width: 1024px) {
      max-width: 120px;
    }
  }

  .swiper-pagination-bullet-active {
    background-color: #ffd600; /* 활성화 색상 유지 */
  }
`;
