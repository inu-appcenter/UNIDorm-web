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
      <Label>
        {label}
        {required && <span className="required"> *</span>}
      </Label>
      <Description>{description}</Description>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;

  .required {
    color: red;
  }
`;

const Description = styled.span`
  color: var(--m-3, #f97171);
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;
