import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/constants/paths";
import ArrowRight from "@/assets/arrow-right.svg";

interface MigrationBannerProps {
  /** 추가적인 여백이나 스타일 조절을 위한 className (optional) */
  className?: string;
}

const MigrationBanner = ({ className }: MigrationBannerProps) => {
  const navigate = useNavigate();

  return (
    <BannerWrapper 
      className={className}
      onClick={() => navigate(PATHS.FRESHMAN_MIGRATION)}
    >
      <MigrationText>
        <h3>학번 계정으로 통합하기</h3>
        <p>신입생 임시 계정을 학교 포털 계정으로 통합하세요.</p>
      </MigrationText>
      <img src={ArrowRight} alt="이동" />
    </BannerWrapper>
  );
};

export default MigrationBanner;

const BannerWrapper = styled.div`
  width: 100%;
  padding: 18px 20px;
  box-sizing: border-box;
  background: white;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  border: 1px solid #f0f0f0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #0a84ff;
  }

  &:active {
    transform: translateY(1px);
    background: #fdfdfd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  img {
    width: 20px;
    height: 20px;
    filter: invert(41%) sepia(91%) deg(204deg) saturate(3781%) hue-rotate(195deg)
      brightness(101%) contrast(105%);
    opacity: 0.7;
  }
`;

const MigrationText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  h3 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 6px;

    &::after {
      content: "NEW";
      font-size: 10px;
      background: #0a84ff;
      color: white;
      padding: 2px 6px;
      border-radius: 10px;
      font-weight: 800;
    }
  }

  p {
    font-size: 13px;
    margin: 0;
    color: #666;
    line-height: 1.4;
    text-align: left;
  }
`;
