// TipWritePage.tsx
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { MdImage } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import SquareButton from "../../components/common/SquareButton.tsx";
import tokenInstance from "../../apis/tokenInstance.ts";
import Header from "../../components/common/Header.tsx";

export default function TipWritePage() {
  const navigate = useNavigate();
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

  // 이미지 중복 제거 + 용량 검사 + 개수 제한
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);

      // 기존 이미지와 합쳐서 중복 제거 (파일명+사이즈 기준)
      const newFiles = [...images, ...fileList].filter(
        (file, index, self) =>
          index ===
          self.findIndex((f) => f.name === file.name && f.size === file.size),
      );

      // 용량 제한 (5MB)
      for (const file of newFiles) {
        if (file.size > 5 * 1024 * 1024) {
          alert("이미지는 5MB 이하만 업로드 가능합니다.");
          return;
        }
      }

      // 최대 10장까지만 허용
      setImages(newFiles.slice(0, 10));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!title.trim() || !content.trim()) {
        alert("제목과 내용을 모두 입력해주세요.");
        return;
      }

      // 글자 수 제한
      if (title.length > 100) {
        alert("제목은 100자 이하로 입력해주세요.");
        return;
      }
      if (content.length > 2000) {
        alert("내용은 2000자 이하로 입력해주세요.");
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

      // 이미지 추가
      if (!isEditMode || (isEditMode && images.length > 0)) {
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
      }

      let res;

      if (isEditMode) {
        res = await tokenInstance.put(`/tips/${tipid}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("팁이 수정되었습니다!");
      } else {
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
      <Header title={"기숙사 꿀팁 작성"} hasBack={true} />

      <Content>
        <Label>제목</Label>
        <Input
          placeholder="글 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Label>내용</Label>
        <Textarea
          placeholder="내용을 입력해주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Label>이미지</Label>
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

      {/*<SubmitButton onClick={handleSubmit}>등록하기</SubmitButton>*/}
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
  height: 80px;
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

// const SubmitButton = styled.button`
//   position: fixed;
//   bottom: 90px;
//   left: 16px;
//   right: 16px;
//   background: #007bff;
//   color: white;
//   border: none;
//   border-radius: 12px;
//   padding: 16px;
//   font-weight: bold;
//   font-size: 16px;
//   cursor: pointer;
//   z-index: 1001;
// `;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;

  padding: 12px 16px;
  box-sizing: border-box;

  bottom: 0;
  left: 0;
`;
