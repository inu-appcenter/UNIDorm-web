import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { MdImage } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import tokenInstance from "../../apis/tokenInstance.ts";
import Header from "../../components/common/Header.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import { ComplainType, dormitory } from "../../constants/constants.ts";

export default function ComplainWritePage() {
  const navigate = useNavigate();
  const [selectedComplainTypeIndex, setSelectedComplainTypeIndex] = useState<
    number | null
  >(null);
  const [selectedDomitoryIndex, setSelectedDomitoryIndex] = useState<
    number | null
  >(null);

  const [tipid, setTipid] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const location = useLocation();
  const { tip } = location.state || {};
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (tip) {
      setTipid(tip.id);
      setTitle(tip.title);
      setContent(tip.content);
      setIsEditMode(true);
    }
  }, [tip]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setImages((prev) => [...prev, ...fileList].slice(0, 10));
    }
  };

  const handleSubmit = async () => {
    try {
      // 필수 값 검사
      if (selectedComplainTypeIndex === null) {
        alert("민원 유형을 선택해주세요.");
        return;
      }

      if (selectedDomitoryIndex === null) {
        alert("기숙사를 선택해주세요.");
        return;
      }

      if (!tipid.trim()) {
        // 사생번호
        alert("사생번호를 입력해주세요.");
        return;
      }

      if (!title.trim()) {
        alert("제목을 입력해주세요.");
        return;
      }

      if (!content.trim()) {
        alert("내용을 입력해주세요.");
        return;
      }

      const formData = new FormData();

      const tipDto = new Blob(
        [
          JSON.stringify({
            title: title,
            content: content,
          }),
        ],
        { type: "application/json" },
      );

      formData.append("requestTipDto", tipDto);

      // 수정 모드가 아닐 경우에만 이미지 필수
      if (!isEditMode || (isEditMode && images.length > 0)) {
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
      }

      let res;

      if (isEditMode) {
        // 수정 요청 (PUT) — `/tips/{id}`로 전송 (tipId 필요)
        res = await tokenInstance.put(`/tips/${tipid}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("팁이 수정되었습니다!");
      } else {
        // 등록 요청 (POST)
        res = await tokenInstance.post("/tips", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("팁이 등록되었습니다!");
      }

      console.log("성공", res.data);
      navigate("/tips");
    } catch (err: any) {
      console.error("실패", err);
      if (err.response?.data?.message) {
        alert(`[서버 응답] ${err.response.data.message}`);
      } else {
        alert("처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <Wrapper>
      <Header title={"민원 접수"} hasBack={true} />

      <Content>
        <Label>
          유형<span className="required"> *</span>
        </Label>
        <SelectableChipGroup
          Groups={ComplainType}
          selectedIndex={selectedComplainTypeIndex}
          onSelect={setSelectedComplainTypeIndex}
        />
        <Label>
          기숙사<span className="required"> *</span>
        </Label>
        <SelectableChipGroup
          Groups={dormitory}
          selectedIndex={selectedDomitoryIndex}
          onSelect={setSelectedDomitoryIndex}
        />
        <Label>
          사생번호<span className="required"> *</span>
        </Label>
        <Input
          placeholder="사생번호를 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />{" "}
        <Label>연락처</Label>
        <Input
          placeholder="연락처를 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label>
          제목<span className="required"> *</span>
        </Label>
        <Input
          placeholder="글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label>
          내용<span className="required"> *</span>
        </Label>
        <Textarea
          placeholder="내용을 입력해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Label>이미지</Label>
        상황 설명에 도움이 되는 이미지가 있으면 첨부해 주세요.
        {isEditMode && (
          <>이미지를 첨부하면 기존 글에 첨부된 이미지가 대체됩니다.</>
        )}
        <ImageBox onClick={() => inputRef.current?.click()}>
          <MdImage size={36} color="#888" />
          <span>{images.length}/10</span>
          {/* 여러 장 미리보기 */}
          {images.map((file, idx) => (
            <img
              key={idx}
              src={URL.createObjectURL(file)}
              alt={`업로드 이미지${idx + 1}`}
              style={{ width: 36, height: 36, borderRadius: 8, marginLeft: 4 }}
            />
          ))}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageChange}
          />
        </ImageBox>
      </Content>
      <ButtonWrapper>
        <SquareButton text="등록하기" onClick={handleSubmit} />
      </ButtonWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fafafa;
`;

const Content = styled.div`
  flex: 1;
  padding: 90px 20px 120px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

const ImageBox = styled.div`
  width: 100%;
  min-height: 80px;
  background: #eee;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #555;

  img {
    width: 24px;
    height: 24px;
  }
`;

const Label = styled.label`
  font-weight: 600;

  .required {
    color: red;
  }
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: rgb(255, 255, 255);
`;

const Textarea = styled.textarea`
  min-height: 200px;
  padding: 12px;
  border-radius: 8px;
  border: none;
  background: rgb(255, 255, 255);
  resize: none;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;

  padding: 12px 16px;
  box-sizing: border-box;

  bottom: 0;
  left: 0;
`;
