import { useEffect, useState } from "react";
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
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminField,
  AdminFieldGrid,
  AdminInput,
  AdminLabel,
  AdminPage,
  AdminShell,
  AdminSubtleText,
  AdminTextarea,
} from "@/pages/Admin/adminPageStyles";
import { RequestPopupNotificationDto } from "@/types/popup-notifications";

const POPUP_TYPE_OPTIONS = [
  {
    value: "룸메이트",
    title: "룸메이트",
    description: "매칭, 설정, 체크리스트 관련 팝업 공지에 적합합니다.",
  },
  {
    value: "공동구매",
    title: "공동구매",
    description: "참여 독려나 기간 한정 이벤트를 강조할 때 좋습니다.",
  },
  {
    value: "생활관",
    title: "생활관",
    description: "기숙사 운영 안내와 생활관 전용 정보를 노출합니다.",
  },
  {
    value: "유니돔",
    title: "유니돔",
    description: "전체 사용자에게 보여야 하는 홈 팝업 공지용입니다.",
  },
  {
    value: "서포터즈",
    title: "서포터즈",
    description: "서포터즈 운영 메시지나 캠페인 홍보에 사용합니다.",
  },
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

const PopupNotiFormPage = () => {
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
    alert("팝업 공지 정보를 불러오지 못했습니다.");
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

    if (!formData.title || !formData.content) {
      alert("제목과 내용을 모두 입력해 주세요.");
      return;
    }

    if (formData.startDate > formData.deadline) {
      alert("종료일은 시작일보다 빠를 수 없습니다.");
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
        alert("팝업 공지를 수정했습니다.");
      } else {
        await createPopupNotification(formData, uploadedImages);
        alert("팝업 공지를 등록했습니다.");
      }

      navigate(-1);
    } catch (error) {
      console.error(
        `팝업 공지 ${isEditMode ? "수정" : "등록"} 실패:`,
        error,
      );
      alert(`팝업 공지를 ${isEditMode ? "수정" : "등록"}하지 못했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  const pageTitle = isEditMode
    ? "홈 화면 팝업 공지 수정"
    : "홈 화면 팝업 공지 등록";
  const submitButtonText = isEditMode ? "변경 사항 저장하기" : "팝업 공지 등록하기";
  const loadingButtonText = isEditMode ? "저장하고 있어요..." : "등록하고 있어요...";
  const selectedPopupType =
    POPUP_TYPE_OPTIONS.find(
      (option) => option.value === formData.notificationType,
    ) ?? POPUP_TYPE_OPTIONS[3];

  useSetHeader({ title: pageTitle });

  return (
    <AdminShell>
      <AdminPage>
        <FormContainer onSubmit={handleSubmit}>
          {/* PC 스플릿 그리드: 좌측 폼 (7), 우측 실시간 미리보기 (5) */}
          <SplitLayout>
            <FormMainSection>
              <AdminCard>
                <AdminCardHeader>
                  <AdminCardTitleGroup>
                    <AdminCardTitle>{pageTitle}</AdminCardTitle>
                    <AdminCardDescription>
                      유형, 제목, 내용, 일정과 이미지를 입력해 주세요. 우측에서 사용자 화면 모습을 실시간으로 확인할 수 있습니다.
                    </AdminCardDescription>
                  </AdminCardTitleGroup>
                </AdminCardHeader>

                <FormBody>
                  {/* 노출 유형 세그먼트 칩 */}
                  <AdminField>
                    <AdminLabel>노출 유형</AdminLabel>
                    <SegmentGrid>
                      {POPUP_TYPE_OPTIONS.map((option) => (
                        <SegmentButton
                          key={option.value}
                          type="button"
                          $selected={formData.notificationType === option.value}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              notificationType: option.value,
                            }))
                          }
                        >
                          {option.title}
                        </SegmentButton>
                      ))}
                    </SegmentGrid>
                    <AdminSubtleText>
                      {selectedPopupType.description}
                    </AdminSubtleText>
                  </AdminField>

                  {/* 제목 입력 */}
                  <AdminField>
                    <FieldHeaderRow>
                      <AdminLabel htmlFor="popup-title">제목</AdminLabel>
                      <FieldLengthHint>{formData.title.length}자</FieldLengthHint>
                    </FieldHeaderRow>
                    <AdminInput
                      id="popup-title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="예: 오늘 밤 11시 기숙사 정기 점검 안내"
                      required
                    />
                  </AdminField>

                  {/* 내용 입력 */}
                  <AdminField>
                    <FieldHeaderRow>
                      <AdminLabel htmlFor="popup-content">내용</AdminLabel>
                      <FieldLengthHint>{formData.content.length}자</FieldLengthHint>
                    </FieldHeaderRow>
                    <AdminTextarea
                      id="popup-content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="팝업에서 보여 줄 핵심 내용을 친절하게 작성해 주세요."
                      required
                    />
                  </AdminField>

                  {/* 노출 일정 */}
                  <AdminFieldGrid>
                    <AdminField>
                      <AdminLabel htmlFor="popup-start-date">시작일</AdminLabel>
                      <AdminInput
                        id="popup-start-date"
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                    </AdminField>
                    <AdminField>
                      <AdminLabel htmlFor="popup-end-date">종료일</AdminLabel>
                      <AdminInput
                        id="popup-end-date"
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        required
                      />
                    </AdminField>
                  </AdminFieldGrid>

                  {/* 이미지 첨부 */}
                  <AdminField>
                    <AdminLabel>이미지 첨부 (최대 5장)</AdminLabel>
                    <FileUploader
                      images={files}
                      onAddImages={handleAddImages}
                      onDeleteImage={handleDeleteImage}
                      isLoading={isFileLoading}
                    />
                    <AdminSubtleText>
                      {isEditMode
                        ? "기존 이미지를 유지하거나, 추가/제외하여 업데이트할 수 있습니다."
                        : "이미지를 첨부하면 팝업 하단에 깔끔하게 표시됩니다."}
                    </AdminSubtleText>
                  </AdminField>

                  {/* PC 전용 폼 내 하단 버튼 */}
                  <DesktopActions>
                    <AdminButton type="submit" disabled={loading}>
                      {loading ? loadingButtonText : submitButtonText}
                    </AdminButton>
                    <AdminButton
                      type="button"
                      $tone="secondary"
                      onClick={() => navigate(-1)}
                      disabled={loading}
                    >
                      취소
                    </AdminButton>
                  </DesktopActions>
                </FormBody>
              </AdminCard>
            </FormMainSection>

            {/* PC 전용 실시간 목업 미리보기 패널 (Sticky) */}
            <LivePreviewSection>
              <PreviewLabelWrap>
                <PreviewLabelTitle>실시간 홈 팝업 미리보기</PreviewLabelTitle>
                <PreviewLabelDesc>실제 사용자 앱 화면과 동일한 바텀시트 비율로 확인됩니다.</PreviewLabelDesc>
              </PreviewLabelWrap>

              <PhoneMockupFrame>
                <MockupSheetContainer>
                  <MockupHandle />
                  <MockupBadgeRow>
                    <AdminBadge $tone="blue">{formData.notificationType}</AdminBadge>
                  </MockupBadgeRow>
                  <MockupTitle>
                    {formData.title.trim() || "팝업 제목이 여기에 표시돼요"}
                  </MockupTitle>
                  <MockupContent>
                    {formData.content.trim() ||
                      "공지 내용을 작성하면 실제 사용자에게 노출되는 형태가 실시간으로 반영됩니다."}
                  </MockupContent>

                  {previewUrls.length > 0 && (
                    <MockupImagePreview>
                      <img
                        src={previewUrls[0]}
                        alt="미리보기"
                        className="w-full h-36 object-cover rounded-xl"
                      />
                      {previewUrls.length > 1 && (
                        <ExtraImageNotice>
                          외 {previewUrls.length - 1}장의 이미지
                        </ExtraImageNotice>
                      )}
                    </MockupImagePreview>
                  )}

                  <MockupCloseCTA>닫기</MockupCloseCTA>
                </MockupSheetContainer>
              </PhoneMockupFrame>
            </LivePreviewSection>
          </SplitLayout>

          {/* 모바일 하단 고정 CTA */}
          <MobileCTAContainer>
            <MobileCTAInner>
              <MobileSecondaryButton
                type="button"
                onClick={() => setIsMobilePreviewOpen(true)}
              >
                미리보기
              </MobileSecondaryButton>
              <MobilePrimaryButton
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
              >
                {loading ? loadingButtonText : submitButtonText}
              </MobilePrimaryButton>
            </MobileCTAInner>
          </MobileCTAContainer>
        </FormContainer>

        {/* 모바일 전용 확인 바텀시트 */}
        <HomeNoticeBottomSheet
          id="admin-home-popup-preview"
          isOpen={isMobilePreviewOpen}
          setIsOpen={setIsMobilePreviewOpen}
          title={formData.title.trim() || "팝업 제목 미리보기"}
          text={formData.content.trim() || "내용을 입력해주세요."}
          links={[]}
          showHideAction={false}
          useStorage={false}
          closeButtonText="미리보기 닫기"
        >
          {previewUrls.length > 0 && (
            <div className="flex flex-col gap-2">
              {previewUrls.map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`미리보기 이미지 ${index + 1}`}
                  className="w-full rounded-xl object-cover"
                />
              ))}
            </div>
          )}
        </HomeNoticeBottomSheet>
      </AdminPage>
    </AdminShell>
  );
};

export default PopupNotiFormPage;

const FormContainer = styled.form`
  width: 100%;
`;

const SplitLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  align-items: start;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.8fr);
    gap: 32px;
  }
`;

const FormMainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const SegmentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 8px;
`;

const SegmentButton = styled.button<{ $selected: boolean }>`
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  font-size: 0.86rem;
  font-weight: 700;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#3182f6" : "#e5e8eb")};
  background: ${({ $selected }) => ($selected ? "#e8f3ff" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#3182f6" : "#4e5968")};
  cursor: pointer;
  transition: all 0.15s ease-out;

  &:hover {
    border-color: #3182f6;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const FieldHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FieldLengthHint = styled.span`
  font-size: 0.78rem;
  color: #8b95a1;
`;

const DesktopActions = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }
`;

const LivePreviewSection = styled.div`
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: sticky;
    top: 80px;
  }
`;

const PreviewLabelWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PreviewLabelTitle = styled.h3`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #191f28;
`;

const PreviewLabelDesc = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: #8b95a1;
`;

const PhoneMockupFrame = styled.div`
  width: 100%;
  max-width: 360px;
  background: #0f172a;
  border-radius: 36px;
  padding: 12px;
  box-shadow: 0 16px 36px -12px rgba(15, 23, 42, 0.25);
  border: 3px solid #1e293b;
`;

const MockupSheetContainer = styled.div`
  background: #ffffff;
  border-radius: 26px;
  padding: 20px;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MockupHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 999px;
  background: #e5e8eb;
  margin: 0 auto 4px;
`;

const MockupBadgeRow = styled.div`
  display: flex;
  align-items: center;
`;

const MockupTitle = styled.h4`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #191f28;
  line-height: 1.35;
`;

const MockupContent = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: #4e5968;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
`;

const MockupImagePreview = styled.div`
  margin-top: auto;
  position: relative;

  img {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 14px;
  }
`;

const ExtraImageNotice = styled.span`
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.65);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
`;

const MockupCloseCTA = styled.div`
  margin-top: 10px;
  width: 100%;
  height: 44px;
  border-radius: 14px;
  background: #f2f4f6;
  color: #4e5968;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
`;

const MobileCTAContainer = styled.div`
  display: block;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;
  max-width: 600px;
  margin: 0 auto;
  pointer-events: none;
  background: linear-gradient(to top, #ffffff 65%, rgba(255, 255, 255, 0));
  padding: 16px 20px calc(14px + env(safe-area-inset-bottom, 0px));

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileCTAInner = styled.div`
  pointer-events: auto;
  display: flex;
  gap: 10px;
`;

const MobileSecondaryButton = styled.button`
  flex: 1;
  height: 52px;
  border-radius: 16px;
  background: #f2f4f6;
  color: #191f28;
  font-size: 0.95rem;
  font-weight: 700;
  border: none;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
`;

const MobilePrimaryButton = styled.button`
  flex: 2;
  height: 52px;
  border-radius: 16px;
  background: #3182f6;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 800;
  border: none;
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.28);
  cursor: pointer;

  &:disabled {
    opacity: 0.45;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;
