import React, { useRef, ChangeEvent } from "react";
import styled from "styled-components";
import LoadingSpinner from "./LoadingSpinner.tsx";

// 부모와 자식이 함께 사용할 타입을 export 합니다.
export interface ImageFile {
  file: File;
  preview: string;
}

// 부모로부터 받아올 props의 타입을 정의합니다.
interface ImageUploaderProps {
  images: ImageFile[];
  onAddImages: (files: FileList) => void;
  onDeleteImage: (index: number) => void;
  isLoading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onAddImages,
  onDeleteImage,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일이 선택되면, 받은 파일을 그대로 부모의 함수로 전달합니다.
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onAddImages(files);
    }
    // input 값 초기화하여 동일한 파일 재업로드 가능하게 함
    if (event.target) {
      event.target.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      <AddButton onClick={triggerFileInput}>이미지 선택</AddButton>
      {isLoading && <LoadingSpinner message="이미지를 불러오는 중..." />}
      {images.length > 0 && (
        <PreviewContainer>
          {images.map((image, index) => (
            <ImageWrapper key={index}>
              <PreviewImage src={image.preview} alt={`미리보기 ${index}`} />
              {/* 삭제 요청 시, 해당 이미지의 인덱스를 부모 함수로 전달합니다. */}
              <DeleteButton onClick={() => onDeleteImage(index)}>
                X
              </DeleteButton>
            </ImageWrapper>
          ))}
        </PreviewContainer>
      )}
    </Container>
  );
};

export default ImageUploader;

const Container = styled.div`
  padding: 20px;
  box-sizing: border-box;
  border: 2px dashed #ccc;
  border-radius: 10px;
  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const AddButton = styled.button`
  padding: 12px 20px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  background-color: #0a84ff;
  color: white;
  border: none;
  border-radius: 8px;
  //margin-bottom: 20px;
  transition: background-color 0.2s;
  width: fit-content;
  height: fit-content;

  &:hover {
    background-color: #0056b3;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  width: 100%;
  //margin-top: 20px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 30%;
  aspect-ratio: 1/1;
  //height: auto;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 0, 0, 0.8);
  }
`;
