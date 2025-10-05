import styled from "styled-components";
import img1 from "../../assets/groupPurchase/오픈채팅생성매뉴얼/1.webp";
import img2 from "../../assets/groupPurchase/오픈채팅생성매뉴얼/2.webp";
import img3 from "../../assets/groupPurchase/오픈채팅생성매뉴얼/3.webp";
import img4 from "../../assets/groupPurchase/오픈채팅생성매뉴얼/4.webp";
import img5 from "../../assets/groupPurchase/오픈채팅생성매뉴얼/5.webp";
import img6 from "../../assets/groupPurchase/오픈채팅생성매뉴얼/6.webp";

const HowToCreateOpenChat = () => {
  return (
    <Wrapper>
      <div>
        <h3>1단계. 카카오톡 접속</h3>
        <p>
          카카오톡 앱을 실행한 뒤, 하단 메뉴에서 '오픈채팅' 아이콘을 선택합니다.
        </p>
        <img src={img1} />
      </div>

      <div>
        <h3>2단계. 오픈채팅 메뉴 진입</h3>
        <p>
          오픈채팅 화면 상단에서 ‘+’ 버튼을 눌러 새 채팅방을 생성할 수 있는
          메뉴로 이동합니다.
        </p>
        <img src={img2} />
        <p>여기서 1:1 채팅 / 그룹채팅 / 오픈프로필 중 그룹채팅을 선택합니다.</p>
        <img src={img3} />
      </div>

      <div>
        <h3>3단계. 채팅방 정보 입력</h3>
        <p>채팅방 이름을 입력합니다. (필수)</p>
        <p>
          채팅방 설명란에 방의 목적, 규칙, 안내 사항 등을 작성할 수 있습니다.
        </p>
        <img src={img4} />
      </div>

      <div>
        <h3>4단계. 참여 설정</h3>
        <p>기본 프로필로 참여 허용 여부를 설정하는 것을 권장합니다.</p>
        <p> 체크 해제 시 오픈프로필을 반드시 설정해야 참여할 수 있습니다.</p>
        <img src={img5} />
      </div>

      <div>
        <h3>5단계. 채팅방 개설 및 공유</h3>
        <p>
          모든 설정을 완료했다면 우측 상단의 ‘완료’ 버튼을 눌러 채팅방을
          생성합니다.
        </p>
        <p>
          생성된 오픈채팅방은 링크 복사, 링크 공유, QR코드 기능을 이용해 다른
          사람과 손쉽게 공유할 수 있습니다.
        </p>
        <img src={img6} />
      </div>
    </Wrapper>
  );
};
export default HowToCreateOpenChat;

const Wrapper = styled.div`
  padding: 16px;
  padding-top: 0;
  box-sizing: border-box;
  color: #48484a;

  img {
    display: block;
    margin: 16px auto;
    max-width: 100%;
    height: auto;
    border-radius: 8px;
  }

  h3 {
    //margin-top: 24px;
    margin-bottom: 0;
  }

  p {
    line-height: 1.6;
  }
`;
