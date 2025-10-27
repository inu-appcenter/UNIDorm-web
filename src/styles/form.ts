import styled from "styled-components";

export const AddButtonArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #0a84ff;
`;

export const AddButton = styled.button`
  border-radius: 60px;
  background: #fff;
  box-shadow: 0 0 16px 0 rgba(10, 132, 255, 0.25);
  width: 40px;
  height: 40px;
  color: #0a84ff;
  font-size: 28px;
`;

export const FormBoxGray = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: fit-content;
  gap: 32px;
  align-items: center;

  padding: 16px;
  box-sizing: border-box;

  border-radius: 16px;
  background: #fff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.25);
`;

export const FormBoxBlue = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  height: fit-content;
  gap: 16px;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 16px;
  background: #fff;
  box-shadow:
    0 0 16px 0 rgba(10, 132, 255, 0.25),
    0 0 10px 0 rgba(0, 0, 0, 0.25);
`;
