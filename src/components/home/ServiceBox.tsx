import styled from "styled-components";

interface Props {
  imgsrc: string;
  title: string;
  onClick?: () => void;
}

const ServiceBox = ({ imgsrc, title, onClick }: Props) => {
  return (
    <ServiceBoxWrapper onClick={onClick}>
      <img src={imgsrc} alt={title} />
      {title}
    </ServiceBoxWrapper>
  );
};

export default ServiceBox;

const ServiceBoxWrapper = styled.button`
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 16px;
  box-sizing: border-box;
  align-items: center;
  flex: 1;

  border-radius: 16px;
  border: 1px solid rgba(10, 132, 255, 0.1);
  background: #fff;
  box-shadow: 0 0 14px 0 rgba(0, 122, 255, 0.2);

  color: var(--1, #1c1c1e);
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px; /* 171.429% */
  letter-spacing: 0.38px;

  img {
    width: 24px;
    height: 24px;
  }
`;
