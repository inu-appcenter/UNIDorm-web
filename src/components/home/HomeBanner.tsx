import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import styled from "styled-components";

// 배너 이미지 import
import 배너1 from "../../assets/banner/포스터1.webp";
import 배너2 from "../../assets/banner/포스터2.webp";

// Swiper에 필요한 CSS를 import합니다.
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";

export default function HomeBanner() {
  return (
    <BannerWrapper>
      <Swiper
        pagination={{ clickable: true }} // 인디케이터 클릭 가능하게 설정
        modules={[Pagination, Autoplay]}
        autoplay={{
          delay: 4000, // 4초마다 자동 슬라이드
          disableOnInteraction: false, // 사용자가 조작해도 자동재생 유지
        }}
        loop={true} // 슬라이드 무한 루프
        className="home-swiper"
      >
        {/* 여기에 배너 슬라이드를 추가합니다. */}
        <SwiperSlide>
          <img className="banner-img" src={배너1} alt="배너 이미지 1" />
        </SwiperSlide>
        <SwiperSlide>
          <img className="banner-img" src={배너2} alt="배너 이미지 2" />
        </SwiperSlide>
      </Swiper>
    </BannerWrapper>
  );
}

const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;

  .home-swiper {
    width: 100%;
    height: 250px; // 기존 배너 높이 유지
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
    height: 250px;
    object-fit: cover;
    cursor: pointer;
  }

  /* Swiper Pagination(인디케이터) 스타일링 */
  .swiper-pagination {
    bottom: 12px !important; // 기존 인디케이터 위치와 유사하게 조정
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0; // 좌우 여백
    box-sizing: border-box;
  }

  .swiper-pagination-bullet {
    height: 3px;
    background-color: #ccc;
    opacity: 1;
    border-radius: 2px;
    flex: 1; /* 기존 Dot 스타일처럼 채우도록 설정 */
    margin: 0 3px !important; /* 점 사이 간격 */
    transition: background-color 0.3s ease;
  }

  .swiper-pagination-bullet-active {
    background-color: #ffd600; /* 활성화된 Dot 색상 */
  }
`;
