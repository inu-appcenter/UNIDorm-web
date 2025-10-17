import { useState, useEffect, useCallback } from "react";
import { urlToFile } from "../utils/fileUtils";

// 서버에서 받아오는 초기 파일 데이터 타입 (모드별 DTO 형태 반영)
export interface InitialFile {
  imageUrl?: string; // 이미지 모드용 URL
  imageName?: string; // 이미지 모드용 파일명
  filePath?: string; // 파일 모드용 URL
  fileName?: string; // 파일 모드용 파일명
  contentType?: string;
}

// 훅 내부에서 관리하는 파일 객체 타입
export interface ManagedFile {
  file: File;
  preview?: string;
}

// 훅에 전달할 props 타입 정의
interface UseFileHandlerProps {
  mode?: "image" | "file";
  initialFiles?: InitialFile[];
  maxCount?: number;
  maxSizeMB?: number;
}

/**
 * 이미지 및 일반 파일을 관리하는 범용 커스텀 훅
 * @param mode - 'image' 또는 'file' 모드를 지정합니다. 기본값은 'image'입니다.
 * @param initialFiles - 수정 모드 시 받아올 초기 파일 데이터 (DTO 형태에 맞춰 전달)
 * @param maxCount - 최대 파일 개수
 * @param maxSizeMB - 최대 파일 크기 (MB)
 */
export const useFileHandler = ({
  mode = "image",
  initialFiles = [],
  maxCount = 10,
  maxSizeMB = 5,
}: UseFileHandlerProps = {}) => {
  const [files, setFiles] = useState<ManagedFile[]>([]);
  const [isFileLoading, setIsFileLoading] = useState(false);

  // 1. 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      files.forEach((managedFile) => {
        if (managedFile.preview) {
          URL.revokeObjectURL(managedFile.preview);
        }
      });
    };
  }, []);

  // 2. 수정 모드일 때 초기 데이터(URL)로부터 File 객체 생성 (DTO 분기 처리)
  useEffect(() => {
    const setInitialData = async () => {
      if (initialFiles && initialFiles.length > 0) {
        setIsFileLoading(true);

        const filePromises = initialFiles.map((initialFile) => {
          console.log("이미지 업로더 모드:", mode);
          // mode에 따라 사용할 URL과 파일명을 결정
          const url =
            mode === "image" ? initialFile.imageUrl : initialFile.filePath;
          const name =
            mode === "image" ? initialFile.imageName : initialFile.fileName;

          // 필수값이 없으면 해당 파일은 건너뜀
          if (!url || !name) {
            console.warn(
              "Initial file data is missing required properties:",
              initialFile,
            );
            return Promise.resolve(null);
          }

          return urlToFile(
            url,
            name,
            initialFile.contentType ? initialFile.contentType : "",
          );
        });

        // null이 아닌 결과만 필터링
        const loadedFiles = (await Promise.all(filePromises)).filter(
          Boolean,
        ) as File[];

        const initialManagedFiles: ManagedFile[] = loadedFiles.map((file) => ({
          file: file,
          ...(mode === "image" && { preview: URL.createObjectURL(file) }),
        }));

        setFiles(initialManagedFiles);
        setIsFileLoading(false);
      }
    };
    setInitialData();
  }, [initialFiles, mode]);

  // 3. 파일 추가 로직 (이전과 동일)
  const addFiles = useCallback(
    (newFiles: FileList) => {
      const filesArray = Array.from(newFiles);
      const maxSizeInBytes = maxSizeMB * 1024 * 1024;

      if (files.length + filesArray.length > maxCount) {
        alert(`파일은 최대 ${maxCount}개까지 첨부할 수 있습니다.`);
        return;
      }

      if (mode === "image") {
        const nonImageFiles = filesArray.filter(
          (file) => !file.type.startsWith("image/"),
        );
        if (nonImageFiles.length > 0) {
          alert("이미지 파일만 업로드할 수 있습니다.");
          return;
        }
      }

      const oversizedFiles = filesArray.filter(
        (file) => file.size > maxSizeInBytes,
      );
      if (oversizedFiles.length > 0) {
        alert(`파일은 ${maxSizeMB}MB 이하만 업로드 가능합니다.`);
        return;
      }

      const uniqueNewFiles = filesArray.filter(
        (newFile) =>
          !files.some(
            (existing) =>
              existing.file.name === newFile.name &&
              existing.file.size === newFile.size,
          ),
      );

      const newManagedFiles: ManagedFile[] = uniqueNewFiles.map((file) => ({
        file: file,
        ...(mode === "image" && { preview: URL.createObjectURL(file) }),
      }));

      setFiles((prev) => [...prev, ...newManagedFiles]);
    },
    [files, maxCount, maxSizeMB, mode],
  );

  // 4. 파일 삭제 로직 (이전과 동일)
  const deleteFile = useCallback(
    (indexToDelete: number) => {
      const fileToDelete = files[indexToDelete];
      if (fileToDelete?.preview) {
        URL.revokeObjectURL(fileToDelete.preview);
      }
      setFiles((prev) => prev.filter((_, index) => index !== indexToDelete));
    },
    [files],
  );

  // 5. 컴포넌트에서 사용할 상태와 함수들을 반환
  return { files, addFiles, deleteFile, isFileLoading };
};
