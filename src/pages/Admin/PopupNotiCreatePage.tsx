import { useState } from "react";
import styled from "styled-components";
import { createPopupNotification } from "../../apis/popup-notification.ts";
import { RequestPopupNotificationDto } from "../../types/popup-notifications.ts";
import Header from "../../components/common/Header.tsx";

const PopupNotiCreatePage = () => {
  const [formData, setFormData] = useState<RequestPopupNotificationDto>({
    title: "",
    content: "",
    notificationType: "룸메이트",
    startDate: "",
    endDate: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(files);
      setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await createPopupNotification(formData, images);
      alert("팝업 공지가 등록되었습니다.");
      setFormData({
        title: "",
        content: "",
        notificationType: "룸메이트",
        startDate: "",
        endDate: "",
      });
      setImages([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("팝업 공지 등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Header title={"홈 화면 팝업 공지 등록"} hasBack={true} />
      <Form onSubmit={handleSubmit}>
        <Label>제목</Label>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="공지 제목을 입력하세요"
          required
        />

        <Label>내용</Label>
        <Textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="공지 내용을 입력하세요"
          required
        />

        <Label>알림 유형</Label>
        <Select
          name="notificationType"
          value={formData.notificationType}
          onChange={handleChange}
        >
          <option value="룸메이트">룸메이트</option>
          <option value="공동구매">공동구매</option>
          <option value="생활원">생활원</option>
          <option value="유니돔">유니돔</option>
          <option value="서포터즈">서포터즈</option>
        </Select>

        <DateGroup>
          <div>
            <Label>시작일</Label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>종료일</Label>
            <Input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </DateGroup>

        <Label>이미지 첨부</Label>
        <Input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />

        {previewUrls.length > 0 && (
          <PreviewContainer>
            {previewUrls.map((url, idx) => (
              <PreviewImg key={idx} src={url} alt={`preview-${idx}`} />
            ))}
          </PreviewContainer>
        )}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? "등록 중..." : "등록하기"}
        </SubmitButton>
      </Form>
    </Wrapper>
  );
};

export default PopupNotiCreatePage;

// ================= Styled Components =================

const Wrapper = styled.div`
  width: 100%;
  max-width: 700px;
  //margin: 0 auto;
  padding: 40px 16px;
  padding-top: 80px;

  box-sizing: border-box;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  box-sizing: border-box;

  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
`;

const Select = styled.select`
  padding: 10px;
  box-sizing: border-box;

  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const DateGroup = styled.div`
  display: flex;
  gap: 20px;
  > div {
    flex: 1;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PreviewImg = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #ddd;
`;

const SubmitButton = styled.button`
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background-color: #005fcc;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
