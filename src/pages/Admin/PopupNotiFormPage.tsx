import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPopupNotification,
  updatePopupNotification,
} from "@/apis/popup-notification";
import FileUploader from "@/components/common/FileUploader";
import HomeNoticeBottomSheet from "@/components/modal/HomeNoticeBottomSheet";
import { useSetHeader } from "@/hooks/useSetHeader";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import { usePopupNotification } from "@/queries/popupNotifications";
import { type InitialFile, useFileHandler } from "@/hooks/useFileHandler";
import { RequestPopupNotificationDto } from "@/types/popup-notifications";

const POPUP_TYPE_OPTIONS = [
  { value: "유니돔", label: "유니돔 (전체 공지)" },
  { value: "생활관", label: "생활관 (기숙사 운영)" },
  { value: "룸메이트", label: "룸메이트" },
  { value: "공동구매", label: "공동구매" },
  { value: "서포터즈", label: "서포터즈" },
] as const;

const EMPTY_FORM: RequestPopupNotificationDto = {
  title: "",
  content: "",
  notificationType: "유니돔",
  startDate: "",
  deadline: "",
};

const getImageNameFromUrl = (url: string, index: number) => {
  const fileName = url.split("?")[0].split("#")[0].split("/").pop();
  return fileName && fileName.length > 0
    ? fileName
    : `popup-image-${index + 1}.jpg`;
};

const PopupNotiFormPage: React.FC = () => {
  const { popupNotificationId } = useParams<{ popupNotificationId: string }>();
  const navigate = useNavigate();
  const isEditMode = !!popupNotificationId;

  const [formData, setFormData] = useState<RequestPopupNotificationDto>(EMPTY_FORM);
  const [initialImageFiles, setInitialImageFiles] = useState<InitialFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagesChanged, setImagesChanged] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  const { files, addFiles, deleteFile, isFileLoading } = useFileHandler({
    mode: "image",
    initialFiles: initialImageFiles,
    maxCount: 5,
    maxSizeMB: 5,
  });

  const uploadedImages = files.map(({ file }) => file);
  const previewUrls = files
    .map((image) => image.preview)
    .filter((preview): preview is string => Boolean(preview));

  const { data: notification, isError } = usePopupNotification(
    isEditMode ? Number(popupNotificationId) : undefined,
  );

  useEffect(() => {
    if (!isError) return;
    alert("팝업 공지 정보를 불러오지 못했어요.");
    navigate(-1);
  }, [isError, navigate]);

  useInitFromQuery(
    notification,
    ({ title, content, notificationType, startDate, deadline, imagePath }) => {
      setFormData({ title, content, notificationType, startDate, deadline });
      setInitialImageFiles(
        (imagePath ?? []).map((imageUrl, index) => ({
          imageUrl,
          imageName: getImageNameFromUrl(imageUrl, index),
        })),
      );
      setImagesChanged(false);
    },
    popupNotificationId,
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImages = (newFiles: FileList) => {
    setImagesChanged(true);
    addFiles(newFiles);
  };

  const handleDeleteImage = (index: number) => {
    setImagesChanged(true);
    deleteFile(index);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }
    if (!formData.startDate || !formData.deadline) {
      alert("시작일과 종료일을 모두 선택해 주세요.");
      return;
    }
    if (formData.startDate > formData.deadline) {
      alert("종료일은 시작일보다 빠를 수 없어요.");
      return;
    }

    setLoading(true);

    try {
      if (isEditMode) {
        await updatePopupNotification(
          Number(popupNotificationId),
          formData,
          imagesChanged ? uploadedImages : undefined,
        );
        alert("팝업 공지를 수정했어요.");
      } else {
        await createPopupNotification(formData, uploadedImages);
        alert("팝업 공지를 등록했어요.");
      }

      navigate(-1);
    } catch (error) {
      console.error(`팝업 공지 ${isEditMode ? "수정" : "등록"} 실패:`, error);
      alert(`팝업 공지를 ${isEditMode ? "수정" : "등록"}하지 못했어요.`);
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = isEditMode
    ? "홈 화면 팝업 공지 수정"
    : "홈 화면 팝업 공지 등록";

  useSetHeader({ title: pageTitle });

  return (
    <PageContainer>
      <FormGrid onSubmit={handleSubmit}>
        {/* 좌측 메인 작성 영역 */}
        <FormColumn>
          <FormCard>
            {/* 공지 구분 선택 칩 */}
            <FieldWrapper>
              <FieldLabel>공지 구분</FieldLabel>
              <TypeChipRow>
                {POPUP_TYPE_OPTIONS.map((opt) => (
                  <TypeChip
                    key={opt.value}
                    type="button"
                    $active={formData.notificationType === opt.value}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        notificationType: opt.value,
                      }))
                    }
                  >
                    {opt.label}
                  </TypeChip>
                ))}
              </TypeChipRow>
            </FieldWrapper>

            {/* 제목 입력 */}
            <FieldWrapper>
              <FieldHeaderRow>
                <FieldLabel htmlFor="popup-title">공지 제목</FieldLabel>
                <CharCount>{formData.title.length}자</CharCount>
              </FieldHeaderRow>
              <StyledInput
                id="popup-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예: 오늘 밤 11시 기숙사 정기 점검 안내"
                required
              />
            </FieldWrapper>

            {/* 내용 입력 */}
            <FieldWrapper>
              <FieldHeaderRow>
                <FieldLabel htmlFor="popup-content">공지 내용</FieldLabel>
                <CharCount>{formData.content.length}자</CharCount>
              </FieldHeaderRow>
              <StyledTextarea
                id="popup-content"
                name="content"
                rows={6}
                value={formData.content}
                onChange={handleChange}
                placeholder="팝업에서 보여줄 핵심 내용을 작성해 주세요."
                required
              />
            </FieldWrapper>

            {/* 노출 기간 */}
            <DateGrid>
              <FieldWrapper>
                <FieldLabel htmlFor="popup-start">노출 시작일</FieldLabel>
                <StyledInput
                  id="popup-start"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </FieldWrapper>

              <FieldWrapper>
                <FieldLabel htmlFor="popup-deadline">노출 종료일</FieldLabel>
                <StyledInput
                  id="popup-deadline"
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </FieldWrapper>
            </DateGrid>

            {/* 이미지 첨부 */}
            <FieldWrapper>
              <FieldLabel>이미지 첨부 (최대 5장)</FieldLabel>
              <FileUploader
                images={files}
                onAddImages={handleAddImages}
                onDeleteImage={handleDeleteImage}
                isLoading={isFileLoading}
                mode="image"
              />
            </FieldWrapper>

            {/* 데스크톱 저장 버튼 */}
            <DesktopActionRow>
              <CancelButton type="button" onClick={() => navigate(-1)}>
                취소
              </CancelButton>
              <SubmitButton type="submit" disabled={loading}>
                {loading
                  ? "저장 중..."
                  : isEditMode
                    ? "수정 내용 저장"
                    : "팝업 공지 등록하기"}
              </SubmitButton>
            </DesktopActionRow>
          </FormCard>
        </FormColumn>

        {/* 우측 홈 팝업 미리보기 (PC 전용) */}
        <PreviewColumn>
          <PreviewStickyCard>
            <PreviewCardHeader>
              <PreviewHeading>홈 팝업 미리보기</PreviewHeading>
              <PreviewSubText>
                홈 화면에서 표시될 팝업 형태입니다.
              </PreviewSubText>
            </PreviewCardHeader>

            <PhoneFrame>
              <PopupSimulationCard>
                <SimTypeBadge>{formData.notificationType || "유니돔"}</SimTypeBadge>
                <SimTitle>
                  {formData.title || "공지 제목이 여기에 표시돼요"}
                </SimTitle>
                <SimContent>
                  {formData.content || "작성 중인 공지 내용이 여기에 표시돼요."}
                </SimContent>

                {previewUrls.length > 0 && (
                  <SimImageContainer>
                    <SimPreviewImage src={previewUrls[0]} alt="preview" />
                    {previewUrls.length > 1 && (
                      <SimImageCountBadge>
                        +{previewUrls.length - 1}장 더보기
                      </SimImageCountBadge>
                    )}
                  </SimImageContainer>
                )}

                <SimButtonGroup>
                  <SimSecondaryButton type="button">
                    오늘 하루 보지 않기
                  </SimSecondaryButton>
                  <SimPrimaryButton type="button">
                    닫기
                  </SimPrimaryButton>
                </SimButtonGroup>
              </PopupSimulationCard>
            </PhoneFrame>
          </PreviewStickyCard>
        </PreviewColumn>
      </FormGrid>

      {/* 모바일 전용 하단 고정 액션바 */}
      <MobileFixedBar>
        <MobilePreviewTrigger
          type="button"
          onClick={() => setIsMobilePreviewOpen(true)}
        >
          미리보기
        </MobilePreviewTrigger>
        <MobileSubmitButton type="button" onClick={() => handleSubmit()} disabled={loading}>
          {loading ? "저장 중..." : isEditMode ? "수정 저장" : "공지 등록"}
        </MobileSubmitButton>
      </MobileFixedBar>

      {/* 모바일 팝업 미리보기 모달 */}
      <HomeNoticeBottomSheet
        id="preview-popup"
        isOpen={isMobilePreviewOpen}
        setIsOpen={setIsMobilePreviewOpen}
        title={formData.title || "공지 미리보기"}
        text={formData.content || "내용이 없어요."}
        links={[]}
        showHideAction={false}
        useStorage={false}
        closeButtonText="닫기"
      >
        {previewUrls.length > 0 && (
          <MobilePreviewImgWrapper>
            {previewUrls.map((url, idx) => (
              <img key={idx} src={url} alt={`preview-${idx}`} />
            ))}
          </MobilePreviewImgWrapper>
        )}
      </HomeNoticeBottomSheet>
    </PageContainer>
  );
};

export default PopupNotiFormPage;

/* --- Styled Components (배경색 위임, PC/모바일 최적화) --- */

const PageContainer = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  padding: 8px 16px 120px;

  @media (min-width: 1024px) {
    padding: 16px 0 60px;
  }
`;

const FormGrid = styled.form`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1.25fr) minmax(360px, 0.95fr);
    align-items: start;
    gap: 32px;
  }
`;

const FormColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`;

const FormCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);

  @media (min-width: 768px) {
    padding: 28px;
  }
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  font-weight: 700;
  color: #191f28;
`;

const CharCount = styled.span`
  font-size: 12px;
  color: #8b95a1;
`;

const TypeChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TypeChip = styled.button<{ $active: boolean }>`
  border: 1.5px solid ${({ $active }) => ($active ? "#3182f6" : "#e5e8eb")};
  background: ${({ $active }) => ($active ? "#e8f3ff" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#3182f6" : "#4e5968")};
  font-size: 13px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #3182f6;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 14px;
  color: #191f28;
  outline: none;
  box-sizing: border-box;
  transition: all 0.15s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #f9fafb;
  font-size: 14px;
  color: #191f28;
  line-height: 1.6;
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  transition: all 0.15s ease;

  &::placeholder {
    color: #8b95a1;
  }

  &:focus {
    background: #ffffff;
    border-color: #3182f6;
    box-shadow: 0 0 0 3px rgba(49, 130, 246, 0.12);
  }
`;

const DateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;

  @media (min-width: 600px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const DesktopActionRow = styled.div`
  display: none;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f2f4f6;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const CancelButton = styled.button`
  height: 48px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #f9fafb;
  }
`;

const SubmitButton = styled.button`
  height: 48px;
  padding: 0 28px;
  border-radius: 12px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(49, 130, 246, 0.25);
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: #1b64da;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

/* 우측 미리보기 (PC 전용) */
const PreviewColumn = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`;

const PreviewStickyCard = styled.div`
  position: sticky;
  top: 90px;
  background: #ffffff;
  border: 1px solid #e5e8eb;
  border-radius: 24px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
`;

const PreviewCardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PreviewHeading = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #191f28;
`;

const PreviewSubText = styled.p`
  margin: 0;
  font-size: 13px;
  color: #8b95a1;
`;

const PhoneFrame = styled.div`
  background: #f2f4f6;
  border-radius: 24px;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PopupSimulationCard = styled.div`
  width: 100%;
  max-width: 320px;
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SimTypeBadge = styled.span`
  align-self: flex-start;
  font-size: 11px;
  font-weight: 700;
  color: #3182f6;
  background: #e8f3ff;
  padding: 3px 8px;
  border-radius: 6px;
`;

const SimTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #191f28;
  line-height: 1.4;
`;

const SimContent = styled.p`
  margin: 0;
  font-size: 13px;
  color: #4e5968;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 120px;
  overflow-y: auto;
`;

const SimImageContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const SimPreviewImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
`;

const SimImageCountBadge = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
`;

const SimButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 6px;
`;

const SimSecondaryButton = styled.button`
  flex: 1;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #6b7684;
  font-size: 12px;
  font-weight: 600;
`;

const SimPrimaryButton = styled.button`
  flex: 1;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
`;

/* 모바일 전용 하단 고정 바 */
const MobileFixedBar = styled.div`
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 25;
  background: #ffffff;
  border-top: 1px solid #f2f4f6;
  padding: 10px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  gap: 10px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobilePreviewTrigger = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  border: 1px solid #e5e8eb;
  background: #ffffff;
  color: #4e5968;
  font-size: 14px;
  font-weight: 700;
`;

const MobileSubmitButton = styled.button`
  flex: 2;
  height: 48px;
  border-radius: 14px;
  border: none;
  background: #3182f6;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;

  &:disabled {
    opacity: 0.5;
  }
`;

const MobilePreviewImgWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;

  img {
    width: 100%;
    border-radius: 12px;
  }
`;
