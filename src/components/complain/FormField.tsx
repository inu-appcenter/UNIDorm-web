// components/common/FormField.tsx
import styled from "styled-components";
import { ReactNode } from "react";

interface Props {
  label: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}

export default function FormField({
  label,
  required,
  description,
  children,
}: Props) {
  return (
    <Wrapper>
      <LabelWrapper>
        <Label>
          {label}
          {required && <span className="required"> *</span>}
        </Label>
      </LabelWrapper>

      <Description>
        {description?.split("\n").map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
        {label === "유형" && (
          <>
            시설 민원은{" "}
            <a
              href="https://portal.inu.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
            >
              포털
            </a>
            을 통해 접수해주세요. <br />* 아래 유형 이외의 민원은 1기숙사는{" "}
            <a
              href="https://portal.inu.ac.kr"
              target="_blank"
              rel="noopener noreferrer"
            >
              포털
            </a>
            , 2/3기숙사는{" "}
            <a
              href="https://edumac.kr/mon/index.do?schlType=Univ"
              target="_blank"
              rel="noopener noreferrer"
            >
              EDUFMS
            </a>
            에서 접수해주세요.
          </>
        )}
      </Description>

      {children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LabelWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Label = styled.label`
  font-weight: 600;

  .required {
    color: red;
  }
`;

const Description = styled.span`
  color: #eb0000;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;

  a {
    color: #0a84ff;
  }
`;
