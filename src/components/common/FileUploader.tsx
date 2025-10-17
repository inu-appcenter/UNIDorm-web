import React, { useRef, ChangeEvent } from "react";
import styled from "styled-components";
import LoadingSpinner from "./LoadingSpinner.tsx";
import { ManagedFile } from "../../hooks/useFileHandler.ts";

interface FileUploaderProps {
  images: ManagedFile[];
  onAddImages: (files: FileList) => void;
  onDeleteImage: (index: number) => void;
  isLoading?: boolean;
  mode?: "image" | "file"; // ✅ 추가된 prop
}

const FileUploader: React.FC<FileUploaderProps> = ({
  images,
  onAddImages,
  onDeleteImage,
  isLoading,
  mode = "image", // ✅ 기본값: 이미지 모드
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onAddImages(files);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const isImageMode = mode === "image";

  return (
    <Container>
      <input
        type="file"
        multiple
        accept={isImageMode ? "image/*" : undefined}
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
      />

      <AddButton onClick={triggerFileInput}>
        {isImageMode ? "이미지 선택" : "파일 선택"}
      </AddButton>

      {isLoading && <LoadingSpinner message="불러오는 중..." />}

      {images.length > 0 && (
        <PreviewContainer>
          {images.map((image, index) =>
            isImageMode && image.preview ? (
              <ImageWrapper key={index}>
                <PreviewImage src={image.preview} alt={`미리보기 ${index}`} />
                <DeleteButton onClick={() => onDeleteImage(index)}>
                  X
                </DeleteButton>
              </ImageWrapper>
            ) : (
              <FileWrapper key={index}>
                {image.file.name}
                <DeleteButton onClick={() => onDeleteImage(index)}>
                  X
                </DeleteButton>
              </FileWrapper>
            ),
          )}
        </PreviewContainer>
      )}
    </Container>
  );
};

export default FileUploader;

/* ---------------- Styled Components ---------------- */

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
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 30%;
  aspect-ratio: 1/1;
`;

const FileWrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 8px 16px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #8e8e93;
  color: #8e8e93;
  font-weight: 500;
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
