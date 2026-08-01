import styled from "styled-components";
import profile from "@/assets/profileimg.png";

interface ChatAvatarProps {
  count?: number;
  imageUrl?: string | null;
  images?: (string | null | undefined)[];
}

export default function ChatAvatar({
  count = 1,
  imageUrl,
  images = [],
}: ChatAvatarProps) {
  const effectiveCount = Math.max(1, count);
  const avatarImages = images.length > 0 ? images : [imageUrl];

  const getImgSrc = (idx: number) => {
    const src = avatarImages[idx];
    return src && src.trim() !== "" && src !== "string" ? src : profile;
  };

  if (effectiveCount === 1) {
    return (
      <SingleAvatar>
        <img
          src={getImgSrc(0)}
          alt="프로필"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profile;
          }}
        />
      </SingleAvatar>
    );
  }

  if (effectiveCount === 2) {
    return (
      <TwoAvatarContainer>
        <AvatarImg
          className="img1"
          src={getImgSrc(0)}
          alt="프로필1"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profile;
          }}
        />
        <AvatarImg
          className="img2"
          src={getImgSrc(1)}
          alt="프로필2"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profile;
          }}
        />
      </TwoAvatarContainer>
    );
  }

  if (effectiveCount === 3) {
    return (
      <ThreeAvatarContainer>
        <AvatarImg
          className="top"
          src={getImgSrc(0)}
          alt="프로필1"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profile;
          }}
        />
        <AvatarImg
          className="left"
          src={getImgSrc(1)}
          alt="프로필2"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profile;
          }}
        />
        <AvatarImg
          className="right"
          src={getImgSrc(2)}
          alt="프로필3"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profile;
          }}
        />
      </ThreeAvatarContainer>
    );
  }

  // 4명 이상 (2x2 그리드)
  return (
    <FourAvatarContainer>
      {[0, 1, 2, 3].map((idx) => (
        <AvatarImg
          key={idx}
          src={getImgSrc(idx)}
          alt={`프로필${idx + 1}`}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = profile;
          }}
        />
      ))}
    </FourAvatarContainer>
  );
}

const SingleAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #d9d9d9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarImg = styled.img`
  border-radius: 8px;
  object-fit: cover;
  background: #d9d9d9;
  box-sizing: border-box;
`;

const TwoAvatarContainer = styled.div`
  position: relative;
  width: 45px;
  height: 45px;
  flex-shrink: 0;

  .img1 {
    position: absolute;
    top: 0;
    left: 0;
    width: 30px;
    height: 30px;
    border: 1.5px solid #ffffff;
    z-index: 1;
  }

  .img2 {
    position: absolute;
    top: 15px;
    left: 15px;
    width: 30px;
    height: 30px;
    border: 1.5px solid #ffffff;
    z-index: 2;
  }
`;

const ThreeAvatarContainer = styled.div`
  position: relative;
  width: 45px;
  height: 45px;
  flex-shrink: 0;

  .top {
    position: absolute;
    top: 0;
    left: 11px;
    width: 24px;
    height: 24px;
    border: 1.5px solid #ffffff;
    z-index: 1;
  }

  .left {
    position: absolute;
    top: 21px;
    left: 0;
    width: 24px;
    height: 24px;
    border: 1.5px solid #ffffff;
    z-index: 2;
  }

  .right {
    position: absolute;
    top: 21px;
    left: 18px;
    width: 24px;
    height: 24px;
    border: 1.5px solid #ffffff;
    z-index: 3;
  }
`;

const FourAvatarContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
  width: 45px;
  height: 45px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    border: 1px solid #ffffff;
  }
`;
