import styled from "styled-components";
import Header from "../../components/common/Header.tsx";
import RoundSquareBlueButton from "../../components/button/RoundSquareBlueButton.tsx";
import friends from "../../assets/roommate/Friends.svg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RoommateMatchingRequest } from "../../types/roommates.ts";
import { requestRoommateMatching } from "../../apis/roommate.ts";

export default function RoomMateAddPage() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!studentId.trim()) {
      alert("학번을 입력해주세요.");
      return;
    }

    if (
      !window.confirm(
        "UNI Dorm에서의 룸메이트 매칭 요청은 실제 기숙사 룸메이트 지정과 무관하며, 룸메이트와의 편리한 생활을 위한 서비스를 제공하기 위함입니다.\n반드시 룸메이트 사전 지정 기간에 인천대학교 포털에서 신청해주세요!!!!\n이 점 꼭 인지하시고 확인 버튼을 눌러주세요.",
      )
    ) {
      return;
    }

    const requestData: RoommateMatchingRequest = {
      receiverStudentNumber: studentId,
    };

    try {
      setIsLoading(true);
      const res = await requestRoommateMatching(requestData);
      console.log(res);
      alert("매칭 요청을 보냈습니다!");
      navigate("/roommate");
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert("사용자를 찾을 수 없습니다.");
      } else if (error.response?.status === 409) {
        alert("이미 매칭 요청을 보낸 상태입니다.");
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RoomMateAddPageWrapper>
      <Header title={"룸메이트 등록하기"} hasBack={true} showAlarm={false} />
      <Wrapper>
        <TopArea>
          <img src={friends} />
          <div className="ment">
            {isRegistering
              ? "등록하실 룸메이트의\n학번을 입력해주세요!\n\nUNI Dorm에 한 번이라도 로그인한 이력이 있는 유저만 검색이 가능해요."
              : `현재 매칭된 룸메이트가 있으신가요?\n룸메이트를 등록해서 다양한 서비스를 이용해 보세요!`}
          </div>
          {isRegistering && (
            <input
              type="text"
              className="student-input"
              placeholder="학번 입력"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={isLoading}
            />
          )}
        </TopArea>
        <BottomArea>
          <RoundSquareBlueButton
            btnName={
              isRegistering
                ? isLoading
                  ? "등록 중..."
                  : "룸메이트 요청 보내기"
                : "룸메이트 등록하기"
            }
            onClick={
              isRegistering ? handleSubmit : () => setIsRegistering(true)
            }
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
    width: 260px;

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
