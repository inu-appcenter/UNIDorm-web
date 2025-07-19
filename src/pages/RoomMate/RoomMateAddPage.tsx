import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import RoundSquareButton from "../../components/button/RoundSquareButton.tsx";
import friends from "../../assets/roommate/Friends.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function RoomMateAddPage() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [studentId, setStudentId] = useState("");

  return (
    <RoomMateAddPageWrapper>
      <Header title={"룸메이트 등록하기"} hasBack={true} showAlarm={false} />
      <Wrapper>
        <TopArea>
          <img src={friends} />
          <div className="ment">
            {isRegistering
              ? "등록하실 룸메이트의 학번을 입력해주세요!"
              : `현재 매칭된 룸메이트가 있으신가요?\n룸메이트를 등록해서 다양한 서비스를 이용해 보세요!`}
          </div>
          {isRegistering && (
            <input
              type="text"
              className="student-input"
              placeholder="학번 입력"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          )}
        </TopArea>
        <BottomArea>
          <RoundSquareButton
            btnName={"룸메이트 등록하기"}
            onClick={() => setIsRegistering(true)}
          />
          <a
            className="findbtn"
            onClick={() => {
              navigate("/roommate");
            }}
          >
            룸메를 찾고 싶다면? 룸메 찾으러 가기
          </a>
        </BottomArea>
      </Wrapper>
    </RoomMateAddPageWrapper>
  );
}

const RoomMateAddPageWrapper = styled.div`
  padding: 90px 20px;

  display: flex;
  flex-direction: column;
  gap: 16px;
  box-sizing: border-box;

  width: 100%;
  height: 100%;

  overflow-y: auto;

  background: #fafafa;

  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.div`
  width: fit-content;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 50px;
`;

const TopArea = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-content: center;
  justify-content: center;
  align-items: center;

  .ment {
    text-align: center;
    width: 250px;

    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 19px;
    text-align: center;

    color: #000000;
    white-space: pre-line;
  }

  .student-input {
    width: 250px;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
`;

const BottomArea = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-content: center;
  justify-content: center;
  align-items: center;

  .findbtn {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 14px;
    text-align: center;
    text-decoration-line: underline;

    color: #0a84ff;
    cursor: pointer;
  }
`;
