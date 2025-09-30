import styled from "styled-components";
import { FaUserCircle } from "react-icons/fa";

interface Props {
  authorImagePath: string;
  username: string;
  createDate: string;
  groupOrderType?: string;
}
const UserInfo = ({
  authorImagePath,
  username,
  createDate,
  groupOrderType,
}: Props) => {
  return (
    <Wrapper>
      {authorImagePath ? (
        <img
          src={authorImagePath}
          alt="프사"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <FaUserCircle size={36} color="#ccc" />
      )}{" "}
      <UserText>
        <Nickname>{username}</Nickname>
        <DateText>
          {(() => {
            const d = new Date(createDate);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const hours = String(d.getHours()).padStart(2, "0");
            const minutes = String(d.getMinutes()).padStart(2, "0");
            return `${month}/${day} ${hours}:${minutes}`;
          })()}
        </DateText>
      </UserText>
      <Spacer />
      {groupOrderType && <CategoryTag>{groupOrderType}</CategoryTag>}
    </Wrapper>
  );
};

export default UserInfo;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const UserText = styled.div`
  display: flex;
  flex-direction: column;
`;
const DateText = styled.div`
  font-size: 12px;
  color: gray;
`;
const Spacer = styled.div`
  flex-grow: 1;
`;

const CategoryTag = styled.div`
  background-color: #007bff;
  color: white;
  font-size: 14px;
  padding: 4px 16px;
  border-radius: 20px;
  margin-right: 8px;
`;
const Nickname = styled.div`
  font-weight: 600;
  font-size: 14px;
`;
