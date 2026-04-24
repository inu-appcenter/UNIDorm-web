import { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styled from "styled-components";

import 배너1 from "../../assets/banner/포스터1.webp";
import 배너3 from "../../assets/banner/포스터3.webp";
import 인입런배너 from "@/assets/banner/인입런 배너.webp";
import 학과공지알리미배너 from "@/assets/banner/학과 공지 알리미 배너.webp";
import { getMobilePlatform } from "@/utils/getMobilePlatform.ts";
import { mixpanelTrack } from "@/utils/mixpanel";

type BannerItem = {
  id: string;
  src: string;
  alt: string;
  click?: () => void;
};

export default function HomeBanner() {
  const platform = getMobilePlatform();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleIntipBannerClick = () => {
    if (platform === "ios_webview") {
      window.open("https://apps.apple.com/kr/app/intip/id6740070975", "_blank");
    } else if (platform === "android_webview") {
      window.open(
        "https://play.google.com/store/apps/details?id=inu.appcenter.intip_android",
        "_blank",
      );
    } else {
      window.open("https://intip.inuappcenter.kr", "_blank");
    }
  };

  const banners: BannerItem[] = useMemo(
    () => [
      {
        id: "department-notice",
        src: 학과공지알리미배너,
        alt: "학과 공지 알리미",
        click: handleIntipBannerClick,
      },
      {
        id: "intip",
        src: 인입런배너,
        alt: "인입런",
        click: handleIntipBannerClick,
      },
      { id: "poster-3", src: 배너3, alt: "생활원 안내 3" },
      { id: "poster-1", src: 배너1, alt: "생활원 안내 1" },
    ],
    [platform],
  );

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    [],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      loop: true,
      skipSnaps: false,
      dragFree: false,
      containScroll: false,
      startIndex: 0,
    },
    [autoplay],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const syncSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    syncSelectedIndex();
    emblaApi.on("select", syncSelectedIndex);
    emblaApi.on("reInit", syncSelectedIndex);

    return () => {
      emblaApi.off("select", syncSelectedIndex);
      emblaApi.off("reInit", syncSelectedIndex);
    };
  }, [emblaApi]);

  const handleSlideClick = (index: number, banner: BannerItem) => {
    if (!emblaApi) return;

    if (index !== selectedIndex) {
      emblaApi.scrollTo(index);
      autoplay.reset();
      return;
    }

    // Mixpanel 배너 클릭 추적 추가
    mixpanelTrack.bannerClicked(banner.alt || banner.id, "홈_상단슬라이드");
    banner.click?.();
  };

  return (
    <BannerWrapper>
      <Viewport ref={emblaRef}>
        <Track>
          {banners.map((banner, index) => (
            <Slide key={banner.id}>
              <BannerButton
                type="button"
                $isSelected={index === selectedIndex}
                onClick={() => handleSlideClick(index, banner)}
                aria-label={banner.alt}
              >
                <img
                  className="banner-img"
                  src={banner.src}
                  alt={banner.alt}
                  loading="eager"
                />
              </BannerButton>
            </Slide>
          ))}
        </Track>
      </Viewport>

      <PaginationDots>
        {banners.map((banner, index) => (
          <PaginationDot
            key={banner.id}
            type="button"
            $active={index === selectedIndex}
            onClick={() => {
              emblaApi?.scrollTo(index);
              autoplay.reset();
            }}
            aria-label={`${index + 1}번째 배너 보기`}
          />
        ))}
      </PaginationDots>
    </BannerWrapper>
  );
}

const BannerWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 20px;

  @media (max-width: 1023px) {
    padding-bottom: 0;
  }

  @media (min-width: 1024px) {
    padding-bottom: 40px;
  }
`;

const Viewport = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  align-items: flex-start;
`;

const Slide = styled.div`
  flex: 0 0 100%;
  min-width: 0;
  display: flex;
  justify-content: center;

  @media (min-width: 1024px) {
    flex: 0 0 58%;
    padding: 0 14px;
  }
`;

const BannerButton = styled.button<{ $isSelected: boolean }>`
  width: 96%;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  opacity: ${(props) => (props.$isSelected ? 1 : 0.5)};
  transition:
    transform 0.35s ease,
    opacity 0.35s ease,
    filter 0.35s ease;
  filter: ${(props) => (props.$isSelected ? "none" : "saturate(0.9)")};

  @media (min-width: 1024px) {
    transform: ${(props) => (props.$isSelected ? "scale(1)" : "scale(0.9)")};
  }

  .banner-img {
    display: block;
    width: 100%;
    height: 250px;
    object-fit: cover;
    border-radius: 0;

    @media (min-width: 1024px) {
      height: 340px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }
  }
`;

const PaginationDots = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 0 16px;

  @media (max-width: 1023px) {
    position: absolute;
    left: 50%;
    width: calc(100vw - 32px);
    transform: translateX(-50%);
    bottom: 12px;
    z-index: 4;
    margin-top: 0;
    padding: 0;
  }

  @media (min-width: 1024px) {
    margin-top: 10px;
  }
`;

const PaginationDot = styled.button<{ $active: boolean }>`
  width: 100%;
  flex: 1 1 0;
  max-width: 60px;
  height: 3px;
  border: none;
  border-radius: 2px;
  padding: 0;
  background-color: ${(props) => (props.$active ? "#ffd600" : "#ccc")};
  cursor: pointer;
  transition: background-color 0.2s ease;

  @media (max-width: 1023px) {
    max-width: none;
  }
`;
