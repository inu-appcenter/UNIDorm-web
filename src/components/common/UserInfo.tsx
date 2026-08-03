import styled from "styled-components";
import profileimg from "../../assets/profileimg.png";

interface Props {
  authorImagePath: string;
  username: string;
  createDate?: string | null;
  groupOrderType?: string;
}

const formatCreatedDate = (createDate?: string | null) => {
  if (!createDate) return "";

  const date = new Date(createDate);
  if (Number.isNaN(date.getTime())) return createDate;

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${month}/${day} ${hours}:${minutes}`;
};

const UserInfo = ({
  authorImagePath,
  username,
  createDate,
  groupOrderType,
}: Props) => {
  const imageSrc = authorImagePath || profileimg;
  const formattedCreateDate = formatCreatedDate(createDate);

  return (
    <Wrapper>
      <ProfileImageWrapper>
        <ProfileImage src={imageSrc} alt="프로필 이미지" />
      </ProfileImageWrapper>

      <UserText>
        <Nickname>{username}</Nickname>
        {formattedCreateDate && <DateText>{formattedCreateDate}</DateText>}
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
  //margin-bottom: 16px;
`;

const ProfileImageWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center; /* ✅ 정중앙 정렬 */
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover; /* 이미지 비율 유지 + 꽉 채움 */
  object-position: center center; /* ✅ 이미지 중심 기준을 중앙으로 고정 */
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
