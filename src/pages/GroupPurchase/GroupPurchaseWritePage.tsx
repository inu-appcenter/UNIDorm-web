import { useState } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import CommonBottomModal from "../../components/modal/CommonBottomModal";
// import CheckBeforeContent from "../../components/GroupPurchase/CheckBeforeContent";
import useUserStore from "../../stores/useUserStore";
import {
  createGroupPurchase,
  updateGroupPurchase,
} from "../../apis/groupPurchase";
import { CreateGroupOrderRequest } from "../../types/grouporder";
import { useGroupPurchaseForm } from "../../utils/useGroupPurchaseForm.ts";
import CategorySelector from "../../components/GroupPurchase/CategorySelector.tsx";
import DeadlineSelector from "../../components/GroupPurchase/DeadlineSelector.tsx";
import HowToCreateOpenChat from "../../components/GroupPurchase/HowToCreateOpenChat.tsx";
import LoadingSpinner from "../../components/common/LoadingSpinner.tsx";
import { useImageHandler } from "../../hooks/useImageHandler.ts";
import ImageUploader from "../../components/common/ImageUploader.tsx";

export default function GroupPurchaseWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { post, curImages } = location.state || {};
  // 이미지 상태 및 핸들러 커스텀 훅
  const { images, addImages, deleteImage, isImageLoading } = useImageHandler({
    initialImages: curImages,
  });

  const {
    isEditMode,
    formData,
    formHandlers,
    getDeadlineString,
    validateForm,
  } = useGroupPurchaseForm(post);

  const {
    title,
    price,
    description,
    purchaseLink,
    openchatLink,
    category,
    deadline,
  } = formData;

  const {
    setTitle,
    setPrice,
    setDescription,
    setPurchaseLink,
    setOpenchatLink,
    setCategory,
    setDeadline,
  } = formHandlers;

  const { tokenInfo } = useUserStore();
  const isLoggedIn = Boolean(tokenInfo.accessToken);
  // const [isModalOpen, setIsModalOpen] = useState(true);
  const [isHowtoModalOpen, setIsHowToModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // DeadlineSelector에서 선택한 값 기반으로 문자열 생성
    const deadlineString = getDeadlineString();

    const requestDto: CreateGroupOrderRequest = {
      title,
      description,
      price: Number(price),
      link: purchaseLink,
      openChatLink: openchatLink,
      groupOrderType: category,
      deadline: deadlineString, // ✅ 반영 완료
    };

    console.log("requestDto.deadline", requestDto.deadline);

    try {
      setIsLoading(true);
      if (isEditMode && post?.id) {
        await updateGroupPurchase(post.id, requestDto, images);
        alert("게시글이 수정되었습니다.");
      } else {
        await createGroupPurchase(requestDto, images);
        alert("게시글이 등록되었습니다.");
      }
    } catch (error) {
      console.error("게시글 등록/수정 실패:", error);
      alert("게시글 등록/수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
      navigate(-1);
    }
  };

  const handleTempSave = () => {
    alert("임시 저장되었습니다.");
  };

  return (
    <Wrapper>
      <Header
        title="공동구매 글쓰기"
        hasBack={true}
        rightContent={
          <TempSaveButton onClick={handleTempSave}>임시저장</TempSaveButton>
        }
      />
      {isLoading && <LoadingSpinner overlay message="글 쓰는 중..." />}
      {/*거래 전 확인하세요 모달*/}
      {/*<CommonBottomModal*/}
      {/*  id={"checkbefore"}*/}
      {/*  isOpen={isModalOpen}*/}
      {/*  setIsOpen={setIsModalOpen}*/}
      {/*  children={<CheckBeforeContent />}*/}
      {/*/>*/}
      <CommonBottomModal
        id={"howToCreateOpenChat"}
        title={"오픈채팅 생성 매뉴얼"}
        isOpen={isHowtoModalOpen}
        setIsOpen={setIsHowToModalOpen}
        children={<HowToCreateOpenChat />}
      />
      <SectionTitle>제목</SectionTitle>
      <InputField
        placeholder="공동구매하려는 물품명을 작성해주세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <SectionTitle>카테고리</SectionTitle>
      <CategorySelector
        selectedCategory={category}
        onSelectCategory={setCategory}
      />
      <SectionTitle>가격</SectionTitle>
      <InputField
        type="number"
        placeholder="가격을 입력해주세요"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <SectionTitle>내용</SectionTitle>
      <TextArea
        placeholder="내용을 입력해주세요"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <SectionTitle>구매 링크</SectionTitle>
      <Description>상품의 필요 여부를 판단하는데 도움이 됩니다.</Description>
      <InputField
        placeholder="구매 링크를 입력해주세요"
        value={purchaseLink}
        onChange={(e) => setPurchaseLink(e.target.value)}
      />
      <SectionTitle>
        오픈채팅방 링크{" "}
        <a onClick={() => setIsHowToModalOpen(true)}>
          <span className="underline">어떻게 만드나요?</span>
          {" >"}
        </a>
      </SectionTitle>
      <InputField
        placeholder="오픈채팅방 링크를 입력해주세요"
        value={openchatLink}
        onChange={(e) => setOpenchatLink(e.target.value)}
      />
      <SectionTitle>마감 시간</SectionTitle>
      <DeadlineSelector
        deadline={deadline}
        onDeadlineChange={setDeadline}
        category={category}
      />
      <SectionTitle>이미지 (선택)</SectionTitle>
      <Description>
        상품 이미지를 업로드하면 공동구매가 성사될 확률이 높아져요!
      </Description>
      <ImageUploader
        images={images}
        onAddImages={addImages}
        onDeleteImage={deleteImage}
        isLoading={isImageLoading}
      />

      {isLoggedIn && (
        <BottomFixed>
          <SubmitButton onClick={handleSubmit}>
            {isEditMode ? "수정하기" : "등록하기"}
          </SubmitButton>
        </BottomFixed>
      )}
    </Wrapper>
  );
}

// --- styles ---
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 70px 16px;
  padding-bottom: 100px;
`;

const InputField = styled.input`
  width: 92%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: #fff;
  margin-bottom: 12px;
  font-size: 14px;
`;

const TextArea = styled.textarea`
  width: 92%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #fff;
  margin-bottom: 12px;
  font-size: 14px;
  resize: none;
`;

const SectionTitle = styled.div`
  font-weight: 600;
  margin: 16px 0 8px;

  a {
    color: #0a84ff;
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    cursor: pointer;
    .underline {
      text-decoration-line: underline;
    }
  }
`;

const Description = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
`;

const BottomFixed = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: rgba(244, 244, 244, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: #007bff;
  color: white;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;

const TempSaveButton = styled.button`
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;
