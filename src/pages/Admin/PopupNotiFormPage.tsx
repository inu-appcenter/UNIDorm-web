import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPopupNotification,
  getPopupNotificationById,
  updatePopupNotification,
} from "@/apis/popup-notification";
import FileUploader from "@/components/common/FileUploader";
import HomeNoticeBottomSheet from "@/components/modal/HomeNoticeBottomSheet";
import { useSetHeader } from "@/hooks/useSetHeader";
import { type InitialFile, useFileHandler } from "@/hooks/useFileHandler";
import {
  AdminActionRow,
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const fetchNotification = async () => {
      try {
        const response = await getPopupNotificationById(
          Number(popupNotificationId),
        );
        const {
          title,
          content,
          notificationType,
          startDate,
          deadline,
          imagePath,
        } = response.data;

        setFormData({
          title,
          content,
          notificationType,
          startDate,
          deadline,
        });
        setInitialImageFiles(
          (imagePath ?? []).map((imageUrl, index) => ({
            imageUrl,
            imageName: getImageNameFromUrl(imageUrl, index),
          })),
        );
        setImagesChanged(false);
      } catch (error) {
        console.error("팝업 공지 조회 실패:", error);
        alert("팝업 공지 정보를 불러오지 못했습니다.");
        navigate(-1);
      }
    };

    void fetchNotification();
  }, [isEditMode, navigate, popupNotificationId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
  const submitButtonText = isEditMode ? "변경 사항 저장" : "팝업 공지 등록";
  const loadingButtonText = isEditMode ? "저장 중..." : "등록 중...";
  const selectedPopupType =
    POPUP_TYPE_OPTIONS.find(
      (option) => option.value === formData.notificationType,
    ) ?? POPUP_TYPE_OPTIONS[3];
  const previewTitle = formData.title.trim() || "팝업 제목 미리보기";
  const previewText =
    formData.content.trim() ||
    "내용을 입력하면 실제 홈 화면 바텀시트에서 그대로 확인할 수 있습니다.";

  useSetHeader({ title: pageTitle });

  return (
    <AdminShell>
      <AdminPage>
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardTitle>팝업 공지 작성</AdminCardTitle>
              <AdminCardDescription>
                유형, 일정, 이미지를 입력하고 하단 버튼에서 바로 미리보기 또는
                저장을 진행합니다.
              </AdminCardDescription>
            </AdminCardTitleGroup>
          </AdminCardHeader>

          <Form onSubmit={handleSubmit}>
            <SectionBlock>
              <SectionTitle>기본 정보</SectionTitle>
              <AdminField>
                <AdminLabel htmlFor="popup-title">제목</AdminLabel>
                <AdminInput
                  id="popup-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="예: 오늘 밤 11시 앱 점검 안내"
                  required
                />
                <FieldLengthHint>현재 {formData.title.length}자</FieldLengthHint>
              </AdminField>

              <AdminField>
                <AdminLabel htmlFor="popup-content">내용</AdminLabel>
                <AdminTextarea
                  id="popup-content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="팝업에서 보여 줄 핵심 내용을 입력해 주세요."
                  required
                />
                <FieldLengthHint>
                  현재 {formData.content.length}자
                </FieldLengthHint>
              </AdminField>
            </SectionBlock>

            <SectionBlock>
              <SectionTitle>노출 유형</SectionTitle>
              <AdminField>
                <AdminLabel htmlFor="popup-notification-type">
                  노출 유형 선택
                </AdminLabel>
                <PopupTypeSelect
                  id="popup-notification-type"
                  name="notificationType"
                  value={formData.notificationType}
                  onChange={handleChange}
                >
                  {POPUP_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.title}
                    </option>
                  ))}
                </PopupTypeSelect>
              </AdminField>
              <SelectedTypeDescription>
                {selectedPopupType.description}
              </SelectedTypeDescription>
            </SectionBlock>

            <SectionBlock>
              <SectionTitle>노출 일정</SectionTitle>
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
            </SectionBlock>

            <SectionBlock>
              <SectionTitle>이미지 첨부</SectionTitle>
              <UploadPanel>
                <FileUploader
                  images={files}
                  onAddImages={handleAddImages}
                  onDeleteImage={handleDeleteImage}
                  isLoading={isFileLoading}
                />
              </UploadPanel>
              <AdminSubtleText>
                {isEditMode
                  ? "기존 이미지를 먼저 불러오고, 추가하거나 제외한 현재 목록을 기준으로 저장합니다."
                  : "공동구매 게시글 작성과 같은 이미지 업로더를 사용합니다."}
              </AdminSubtleText>
            </SectionBlock>

            <AdminActionRow>
              <AdminButton type="submit" disabled={loading}>
                {loading ? loadingButtonText : submitButtonText}
              </AdminButton>
              <AdminButton
                type="button"
                $tone="secondary"
                onClick={() => setIsPreviewOpen(true)}
                disabled={loading}
              >
                홈 바텀시트 미리보기
              </AdminButton>
            </AdminActionRow>
          </Form>
        </AdminCard>

        <HomeNoticeBottomSheet
          id="admin-home-popup-preview"
          isOpen={isPreviewOpen}
          setIsOpen={setIsPreviewOpen}
          title={previewTitle}
          text={previewText}
          links={[]}
          showHideAction={false}
          useStorage={false}
          closeButtonText="미리보기 닫기"
        >
          {previewUrls.length > 0 && (
            <PreviewBottomSheetContent>
              {previewUrls.map((url, index) => (
                <img
                  key={`${url}-${index}`}
                  src={url}
                  alt={`홈 팝업 미리보기 이미지 ${index + 1}`}
                />
              ))}
            </PreviewBottomSheetContent>
          )}
        </HomeNoticeBottomSheet>
      </AdminPage>
    </AdminShell>
  );
};

export default PopupNotiFormPage;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const SectionBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
`;

const PopupTypeSelect = styled(AdminInput).attrs({ as: "select" })`
  appearance: none;
  padding-right: 44px;
  background-image:
    linear-gradient(45deg, transparent 50%, #64748b 50%),
    linear-gradient(135deg, #64748b 50%, transparent 50%);
  background-position:
    calc(100% - 20px) calc(50% - 3px),
    calc(100% - 14px) calc(50% - 3px);
  background-size: 6px 6px;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const SelectedTypeDescription = styled(AdminSubtleText)`
  margin-top: -6px;
`;

const FieldLengthHint = styled(AdminSubtleText)`
  width: 100%;
  text-align: right;
  font-size: 0.78rem;
`;

const UploadPanel = styled.div`
  display: flex;
  flex-direction: column;
`;

const PreviewBottomSheetContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;

  img {
    max-width: 100%;
    border-radius: 8px;
  }
`;
