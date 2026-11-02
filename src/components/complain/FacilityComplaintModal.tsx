import React from "react";
import styled from "styled-components";
import Modal from "@/components/modal/Modal";
import { colors } from "@/styles/tokens";

interface FacilityComplaintModalProps {
  show: boolean;
  onClose: () => void;
}

export const FacilityComplaintModal: React.FC<FacilityComplaintModalProps> = ({
  show,
  onClose,
}) => {
  return (
    <Modal
      show={show}
      onClose={onClose}
      title="시설 민원은 여기서 접수할 수 없어요"
      closeButtonText="확인"
      content={
        <ModalBody>
          <WarningBanner>
            공용공간 등 다른 카테고리를 선택하여 시설 관련 민원을 접수하시더라도 처리하지 않습니다.
          </WarningBanner>

          <InstructionText>
            시설 관련 민원은 1기숙사는 포털, 2/3기숙사는 EDUFMS에서 접수해주세요. (고장 일체 해당)
          </InstructionText>

          <LinkSection>
            <ExternalLinkButton
              href="https://portal.inu.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkContent>
                <LinkTitle>1기숙사 시설 민원</LinkTitle>
                <LinkSub>인천대학교 포털 바로가기</LinkSub>
              </LinkContent>
              <LinkArrow aria-hidden="true">›</LinkArrow>
            </ExternalLinkButton>

            <ExternalLinkButton
              href="https://edumac.kr/mon/index.do?schlType=Univ"
              target="_blank"
              rel="noopener noreferrer"
            >
              <LinkContent>
                <LinkTitle>2·3기숙사 시설 민원</LinkTitle>
                <LinkSub>EDUFMS 바로가기</LinkSub>
              </LinkContent>
              <LinkArrow aria-hidden="true">›</LinkArrow>
            </ExternalLinkButton>
          </LinkSection>
        </ModalBody>
      }
    />
  );
};

export default FacilityComplaintModal;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding-top: 4px;
`;

const WarningBanner = styled.div`
  background: #fff5f5;
  border: 1px solid #ffe3e3;
  border-radius: 12px;
  padding: 12px 14px;
  color: #eb0000;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  word-break: keep-all;
  text-align: center;
`;

const InstructionText = styled.p`
  font-size: 13.5px;
  color: ${colors.gray.gray700 || "#4e5968"};
  line-height: 1.5;
  text-align: center;
  margin: 0;
  word-break: keep-all;
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const ExternalLinkButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background: #f1f3f5;
  }

  &:active {
    background: #e9ecef;
  }
`;

const LinkContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
`;

const LinkTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: #191f28;
`;

const LinkSub = styled.span`
  font-size: 12px;
  color: #3182f6;
`;

const LinkArrow = styled.span`
  font-size: 18px;
  font-weight: 300;
  color: #8b95a1;
  line-height: 1;
`;
