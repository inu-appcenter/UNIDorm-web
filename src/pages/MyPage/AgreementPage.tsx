import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../../components/common/Header/Header.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import { putUserAgreement } from "../../apis/members.ts";
import { useNavigate } from "react-router-dom";

// --- 약관 정보 ---
const agreements = [
  {
    id: "terms",
    label: "(필수) 유니돔 서비스 이용약관",
    url: "https://unidorm.inuappcenter.kr/terms-of-use.html",
    required: true,
  },
  {
    id: "privacy",
    label: "(필수) 유니돔 서비스 개인정보 수집 및 이용 동의",
    url: "https://unidorm.inuappcenter.kr/privacy-policy.html",
    required: true,
  },
];

// --- React Component ---
const AgreementPage: React.FC = () => {
  const navigate = useNavigate();

  const [agreementsState, setAgreementsState] = useState<{
    [key: string]: boolean;
  }>(
    agreements.reduce(
      (acc, agreement) => ({ ...acc, [agreement.id]: false }),
      {},
    ),
  );

  const [allAgreed, setAllAgreed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const allRequiredAgreed = agreements
    .filter((a) => a.required)
    .every((a) => agreementsState[a.id]);

  const handleAllAgreeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setAllAgreed(checked);
    const newState = Object.keys(agreementsState).reduce(
      (acc, key) => ({ ...acc, [key]: checked }),
      {},
    );
    setAgreementsState(newState);
  };

  const handleAgreementChange =
    (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { checked } = e.target;
      setAgreementsState((prevState) => ({
        ...prevState,
        [id]: checked,
      }));
    };

  useEffect(() => {
    const allChecked = Object.values(agreementsState).every(Boolean);
    setAllAgreed(allChecked);
  }, [agreementsState]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequiredAgreed) {
      alert("필수 약관에 모두 동의해주셔야 합니다.");
      return;
    }

    try {
      setLoading(true);
      // ✅ 서버에 PUT 요청 보내기
      const response = await putUserAgreement(
        agreementsState["terms"],
        agreementsState["privacy"],
      );
      console.log("서버 응답:", response);
      navigate("/home");
    } catch (error) {
      console.error("동의 처리 중 오류 발생:", error);
      alert("동의 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Container>
      <Header title={"약관 동의"} />
      <span className="description">
        유니돔 서비스 약관이 개정되어 재동의가 필요합니다.
      </span>
      <form onSubmit={handleSubmit}>
        <AllAgreeContainer>
          <CheckboxLabel>
            <CheckboxInput
              type="checkbox"
              checked={allAgreed}
              onChange={handleAllAgreeChange}
            />
            전체 약관에 모두 동의합니다.
          </CheckboxLabel>
        </AllAgreeContainer>

        <AgreementList>
          {agreements.map(({ id, label, url }) => (
            <AgreementRow key={id} onClick={() => handleRowClick(url)}>
              <CheckboxLabel onClick={(e) => e.stopPropagation()}>
                <CheckboxInput
                  type="checkbox"
                  checked={agreementsState[id]}
                  onChange={handleAgreementChange(id)}
                />
                {label}
              </CheckboxLabel>
              <Chevron>&gt;</Chevron>
            </AgreementRow>
          ))}
        </AgreementList>

        <ButtonWrapper>
          <SquareButton
            text={loading ? "처리 중..." : "동의"}
            type="submit"
            disabled={!allRequiredAgreed || loading}
          />
        </ButtonWrapper>
      </form>
    </Container>
  );
};

export default AgreementPage;

// --- Styled Components 정의 ---
const Container = styled.div`
  padding: 16px;
  padding-top: 80px;
  padding-bottom: 160px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  flex: 1;

  width: 100%;
  height: 100%;
  overflow-y: auto;

  background: #f4f4f4;

  .description {
    font-size: 14px;
  }
`;

const AgreementList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AgreementRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
`;

const CheckboxInput = styled.input`
  margin-right: 10px;
  width: 18px;
  height: 18px;
`;

const AllAgreeContainer = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 20px;

  ${CheckboxLabel} {
    font-weight: bold;
    font-size: 18px;
  }
`;

const Chevron = styled.span`
  color: #888;
  font-size: 18px;
  font-weight: bold;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;
  bottom: 0;
  left: 0;
  padding: 16px;
  box-sizing: border-box;
  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;
