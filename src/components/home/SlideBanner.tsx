// components/home/SlideBanner.tsx
import styled from "styled-components";
import { useEffect, useState } from "react";
import 배너1 from "../../assets/banner/포스터1.webp";

const mockBanners = [
  { id: 1, imageUrl: "/assets/banner/포스터1.webp", link: "/event/1" },
];

export default function SlideBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % mockBanners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BannerWrapper>
      <img src={배너1} />

      <Slides current={current}>
        <Slide>
          <img src={배너1} />
        </Slide>
      </Slides>
      <Dots>
        {mockBanners.map((_, index) => (
          <Dot key={index} active={index === current} />
        ))}
      </Dots>
    </BannerWrapper>
  );
}

const BannerWrapper = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 12px;
`;

const Slides = styled.div<{ current: number }>`
  display: flex;
  transition: transform 0.5s ease-in-out;
  transform: translateX(${(props) => `-${props.current * 100}%`});
`;

const Slide = styled.a`
  min-width: 100%;
  height: 160px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Dots = styled.div`
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
`;

const Dot = styled.div<{ active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.active ? "#333" : "#ccc")};
`;
