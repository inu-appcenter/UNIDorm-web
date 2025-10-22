// src/components/common/LabeledField.tsx
import styled from "styled-components";

interface LabeledFieldProps {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}

export default function LabeledField({
  label,
  required = false,
  description,
  children,
}: LabeledFieldProps) {
  return (
    <Wrapper>
      <Label>
        {label}
        {required && <span className="required"> *</span>}
      </Label>
      {description && <Description>{description}</Description>}
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  .required {
    color: red;
  }
`;

const Description = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
`;
