import { useState, useEffect, useCallback } from "react";
import { ImageFile } from "../components/common/ImageUploader";
import { TipImage } from "../types/tips";
import { urlToFile } from "../utils/fileUtils";

// 훅에 전달할 props 타입 정의
interface UseImageHandlerProps {
  initialImages?: TipImage[]; // 수정 모드 시 받아올 초기 이미지 데이터
  maxCount?: number; // 최대 이미지 개수
  maxSizeMB?: number; // 최대 파일 크기 (MB)
}

export const useImageHandler = ({
  initialImages = [],
  maxCount = 10,
  maxSizeMB = 5,
}: UseImageHandlerProps = {}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // 1. 컴포넌트 언마운트 시 전체 메모리 정리
  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []); // 이 useEffect는 images를 의존하지 않아야 합니다.

  // 2. 수정 모드일 때 서버 URL로부터 File 객체 생성
  useEffect(() => {
    const setInitialData = async () => {
      if (initialImages && initialImages.length > 0) {
        setIsImageLoading(true);

        const imageFilesPromises = initialImages.map((img) =>
          urlToFile(img.imageUrl, img.imageName, img.contentType),
        );
        const loadedFiles = await Promise.all(imageFilesPromises);

        const initialImageFiles: ImageFile[] = loadedFiles.map((file) => ({
          file: file,
          preview: URL.createObjectURL(file),
        }));

        setImages(initialImageFiles);
        setIsImageLoading(false);
      }
    };
    setInitialData();
  }, [initialImages]); // initialImages가 변경될 때만 실행

  // 3. 이미지 추가 로직
  const addImages = useCallback(
    (newFiles: FileList) => {
      const filesArray = Array.from(newFiles);
      const maxSizeInBytes = maxSizeMB * 1024 * 1024;

      if (images.length + filesArray.length > maxCount) {
        alert(`이미지는 최대 ${maxCount}장까지 첨부할 수 있습니다.`);
        return;
      }

      const oversizedFiles = filesArray.filter(
        (file) => file.size > maxSizeInBytes,
      );
      if (oversizedFiles.length > 0) {
        alert(`이미지는 ${maxSizeMB}MB 이하만 업로드 가능합니다.`);
        return;
      }

      const uniqueNewFiles = filesArray.filter(
        (newFile) =>
          !images.some(
            (existing) =>
              existing.file.name === newFile.name &&
              existing.file.size === newFile.size,
          ),
      );

      const newImageFiles = uniqueNewFiles.map((file) => ({
        file: file,
        preview: URL.createObjectURL(file),
      }));

      setImages((prev) => [...prev, ...newImageFiles]);
    },
    [images, maxCount, maxSizeMB],
  );

  // 4. 이미지 삭제 로직
  const deleteImage = useCallback(
    (indexToDelete: number) => {
      URL.revokeObjectURL(images[indexToDelete].preview);
      setImages((prev) => prev.filter((_, index) => index !== indexToDelete));
    },
    [images],
  );

  // 5. 컴포넌트에서 사용할 상태와 함수들을 반환
  return { images, addImages, deleteImage, isImageLoading };
};
