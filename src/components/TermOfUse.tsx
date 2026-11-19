import { Trans } from "react-i18next";
import styled from "styled-components";
import { colors, typography } from "@/styles/tokens";

export default function TermOfUse() {
  return (
    <StyledDiv>
      <Trans
        i18nKey="terms.notice"
        ns="onboarding"
        components={{ strong: <strong /> }}
      />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  ${typography.label2}
  width: 100%;
  color: ${colors.text.text2};
  text-align: center;
  word-break: keep-all;
`;
