import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import StyledInput from "../../components/common/StyledInput.tsx";
import SquareButton from "../../components/common/SquareButton.tsx";
import { useEffect, useState } from "react";
import {
  deleteMembers,
  getMemberInfo,
  putMember,
  putUserImage,
} from "@/apis/members";
import { useQueryClient } from "@tanstack/react-query";
import { memberKeys, useMemberImage } from "@/queries/members";
import { useInitFromQuery } from "@/hooks/useInitFromQuery";
import useUserStore from "../../stores/useUserStore.ts";
import TitleContentArea from "../../components/common/TitleContentArea.tsx";
import ToggleGroup from "../../components/roommate/checklist/ToggleGroup.tsx";
import SelectableChipGroup from "../../components/roommate/checklist/SelectableChipGroup.tsx";
import { colleges, dormitory } from "@/constants/constants";
import { isAxiosError } from "axios";
import profile from "../../assets/profileimg.png";
import { useSetHeader } from "@/hooks/useSetHeader";
import MigrationBanner from "@/components/common/MigrationBanner";
import { useFreshmanMigrationBanner } from "@/hooks/useFreshmanMigrationBanner";
import { PATHS } from "@/constants/paths";

export default function MyInfoEditPage() {
  const { t } = useTranslation("mypage");
  const queryClient = useQueryClient();
  const { userInfo, setUserInfo } = useUserStore();
  const { data: memberImage } = useMemberImage();
  console.log(userInfo);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isFirstVisit = queryParams.get("firstvisit") === "true";

  const navigate = useNavigate();
  const studentNumber = userInfo.studentNumber;
  const {
    bannerVariant,
    handleMigrationBannerClick,
    shouldShowMigrationBanner,
  } = useFreshmanMigrationBanner();
  const [nickname, setNickname] = useState(userInfo.name);
  const [selectedDomitoryIndex, setSelectedDomitoryIndex] = useState<
    number | null
  >(null);
  const [selectedCollegeIndex, setSelectedCollegeIndex] = useState<
    number | null
  >(null);

  function findIndex(datas: string[], findStr: string): number {
    return datas.findIndex((data) => findStr.includes(data));
  }

  useEffect(() => {
    const initialCollegeIndex = findIndex(colleges, userInfo.college);
    const initialDormitoryIndex = findIndex(dormitory, userInfo.dormType);

    setSelectedCollegeIndex(initialCollegeIndex >= 0 ? initialCollegeIndex : null);
    setSelectedDomitoryIndex(
      initialDormitoryIndex >= 0 ? initialDormitoryIndex : null,
    );
  }, [userInfo.college, userInfo.dormType]);

  const isValidSelectionIndex = (
    index: number | null,
    datas: string[],
  ): index is number => {
    return index != null && index >= 0 && index < datas.length;
  };

  const getMissingFields = () => {
    const missingFields: string[] = [];

    if (typeof nickname !== "string" || nickname.trim() === "") {
      missingFields.push(t("myInfoEdit.fields.nickname"));
    }

    if (!isValidSelectionIndex(selectedDomitoryIndex, dormitory)) {
      missingFields.push(t("myInfoEdit.fields.dormitory"));
    }

    if (!isValidSelectionIndex(selectedCollegeIndex, colleges)) {
      missingFields.push(t("myInfoEdit.fields.college"));
    }

    return missingFields;
  };

  const menuItems = [
    {
      label: t("myInfoEdit.withdraw"),
      onClick: async () => {
        try {
          const confirmed = window.confirm(t("myInfoEdit.withdrawConfirm"));
          if (!confirmed) return;

          const status = await deleteMembers();

          switch (status) {
            case 204:
              alert(t("myInfoEdit.withdrawSuccess"));
              navigate(PATHS.LOGOUT, { replace: true });
              break;
            case 403:
              alert(t("myInfoEdit.withdraw403"));
              break;
            case 404:
              alert(t("myInfoEdit.withdraw404"));
              break;
            default:
              alert(t("myInfoEdit.withdrawUnknownError"));
          }
        } catch (error) {
          console.error("회원 탈퇴 중 예외 발생:", error);
          alert(t("myInfoEdit.withdrawNetworkError"));
        }
      },
    },
  ];

  const isFilled = () => {
    return getMissingFields().length === 0;
  };

  const handleSubmit = async () => {
    try {
      const trimmedNickname = nickname.trim();
      const missingFields = getMissingFields();

      if (missingFields.length > 0) {
        alert(t("myInfoEdit.missingFields", { fields: missingFields.join(", ") }));
        return;
      }

      if (
        !isValidSelectionIndex(selectedCollegeIndex, colleges) ||
        !isValidSelectionIndex(selectedDomitoryIndex, dormitory)
      ) {
        return;
      }

      if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
        alert(t("myInfoEdit.nicknameLengthError"));
        return;
      }

      const response = await putMember(
        trimmedNickname,
        colleges[selectedCollegeIndex],
        dormitory[selectedDomitoryIndex],
      );
      console.log(response);

      if (response.status === 200) {
        if (isFirstVisit) {
          alert(t("myInfoEdit.saveSuccessFirst"));
        } else {
          alert(t("myInfoEdit.saveSuccess"));
        }
        try {
          const updated = await queryClient.fetchQuery({
            queryKey: memberKeys.info(),
            queryFn: async () => (await getMemberInfo()).data,
          });
          setUserInfo(updated);
        } catch (error) {
          console.error("회원 가져오기 실패", error);
        }
        navigate("/mypage");
      } else {
        alert(t("myInfoEdit.saveError"));
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          alert(t("myInfoEdit.nicknameConflict"));
        } else {
          alert(t("myInfoEdit.saveError"));
        }
      } else {
        alert(t("myInfoEdit.unknownError"));
      }
      console.error(error);
    }
  };

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useInitFromQuery(memberImage?.imageUrl, (url) => {
    setPreviewUrl(url);
  });

  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. 허용된 이미지 형식
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      alert(t("myInfoEdit.invalidImageType"));
      return;
    }

    // 2. 3MB 이하 용량 제한
    const maxSizeInBytes = 2 * 1024 * 1024; // 3MB
    if (file.size > maxSizeInBytes) {
      alert(t("myInfoEdit.imageSizeLimit"));
      return;
    }

    // 3. 상태 업데이트
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadImage = async () => {
    if (!imageFile) {
      return;
    }

    try {
      const response = await putUserImage(imageFile);
      if (response.status === 200) {
        alert(t("myInfoEdit.imageSuccess"));
      } else {
        alert(t("myInfoEdit.imageFailed"));
      }
    } catch (error) {
      alert(t("myInfoEdit.imageError"));
      console.error(error);
    }
  };

  useSetHeader({ title: t("myInfoEdit.title"), menuItems });

  return (
    <MyInfoEditPageWrapper>
      <ContentWrapper>
        {/* 프로필 이미지 업로드 */}
        {!isFirstVisit && (
          <TitleContentArea
            title={t("myInfoEdit.profilePhotoTitle")}
            description={t("myInfoEdit.profilePhotoDesc")}
            children={
              <ImageUploadContainer>
                <ImageSelectRow>
                  <ProfileImageWrapper>
                    <ProfileImage
                      src={previewUrl || profile}
                      alt={t("myInfoEdit.profileAlt")}
                    />
                  </ProfileImageWrapper>

                  <FileInputLabel htmlFor="profileImageInput">
                    {t("myInfoEdit.selectImage")}
                  </FileInputLabel>
                  <HiddenFileInput
                    id="profileImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </ImageSelectRow>

                <UploadButtonWrapper>
                  <SquareButton
                    text={t("myInfoEdit.changeImage")}
                    onClick={handleUploadImage}
                    disabled={!imageFile}
                  />
                </UploadButtonWrapper>
              </ImageUploadContainer>
            }
          />
        )}
        {isFirstVisit && (
          <TitleContentArea
            title={""}
            description={t("myInfoEdit.firstVisitGuide")}
            children={<></>}
          />
        )}

        <TitleContentArea
          title={t("myInfoEdit.studentIdTitle")}
          children={
            <>
              <StyledInput
                placeholder={t("myInfoEdit.studentIdPlaceholder")}
                value={studentNumber}
                disabled={true}
              />
              {shouldShowMigrationBanner && (
                <StyledMigrationBanner
                  variant={bannerVariant}
                  onClick={handleMigrationBannerClick}
                />
              )}
            </>
          }
        />

        <TitleContentArea
          title={t("myInfoEdit.nicknameTitle")}
          children={
            <StyledInput
              placeholder={t("myInfoEdit.nicknamePlaceholder")}
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
              }}
            />
          }
        />

        <TitleContentArea
          title={t("myInfoEdit.dormitoryTitle")}
          children={
            <ToggleGroup
              Groups={dormitory}
              selectedIndex={selectedDomitoryIndex}
              onSelect={setSelectedDomitoryIndex}
            />
          }
        />
        <TitleContentArea
          title={t("myInfoEdit.collegeTitle")}
          children={
            <SelectableChipGroup
              Groups={colleges}
              selectedIndex={selectedCollegeIndex}
              onSelect={setSelectedCollegeIndex}
            />
          }
        />
      </ContentWrapper>

      <ButtonWrapper>
        <SquareButton
          text={isFirstVisit ? t("myInfoEdit.saveButton") : t("myInfoEdit.editButton")}
          disabled={!isFilled()}
          onClick={handleSubmit}
        />
      </ButtonWrapper>
    </MyInfoEditPageWrapper>
  );
}
const MyInfoEditPageWrapper = styled.div`
  padding: 16px 16px calc(120px + var(--safe-area-bottom, 0px));
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  //width: 100%;
  //height: 100%;
  //justify-content: space-between;
`;

const ContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;

  //padding-bottom: 50px;
  //margin-bottom: 200px;

  //box-sizing: border-box;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  height: fit-content;
  position: fixed;

  padding: 12px 16px calc(12px + var(--safe-area-bottom, 0px));
  box-sizing: border-box;

  bottom: 0;
  left: 0;

  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImageUploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ImageSelectRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ProfileImageWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  background: #ddd;
  border: 2px solid #ccc;
  flex-shrink: 0;
`;

const FileInputLabel = styled.label`
  cursor: pointer;
  padding: 10px 24px;
  background-color: #4a90e2;
  color: white;
  border-radius: 6px;
  font-weight: 600;
  user-select: none;
  transition: background-color 0.3s ease;
  white-space: nowrap;

  &:hover {
    background-color: #357abd;
  }
`;

const UploadButtonWrapper = styled.div`
  width: 100%;
`;

const StyledMigrationBanner = styled(MigrationBanner)`
  margin-top: 12px;
`;
