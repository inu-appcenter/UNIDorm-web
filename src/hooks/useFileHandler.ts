import { useCallback, useEffect, useRef, useState } from "react";
import { urlToFile } from "@/utils/fileUtils";

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

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];

export const isImageFile = (file: File): boolean => {
  if (file.type && file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? IMAGE_EXTENSIONS.includes(ext) : false;
};

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
  const isInitializedRef = useRef(false);
  const hasUserModifiedRef = useRef(false);
  const filesRef = useRef<ManagedFile[]>([]);
  filesRef.current = files;

  // 1. 컴포넌트 언마운트 시 메모리 정리
  useEffect(() => {
    return () => {
      filesRef.current.forEach((managedFile) => {
        if (managedFile.preview) {
          URL.revokeObjectURL(managedFile.preview);
        }
      });
    };
  }, []);

  // 2. 수정 모드일 때 초기 데이터(URL)로부터 File 객체 생성 (1회만 안전하게 로드)
  const initialFilesKey = (initialFiles || [])
    .map((f) => f.imageUrl || f.filePath || "")
    .filter(Boolean)
    .join(",");

  useEffect(() => {
    // 이미 사용자가 파일을 조작(추가/삭제)했거나 이미 초기화 완료되었으면 재로드하지 않음
    if (hasUserModifiedRef.current || isInitializedRef.current) {
      return;
    }

    if (!initialFiles || initialFiles.length === 0) {
      return;
    }

    let isCancelled = false;

    const setInitialData = async () => {
      setIsFileLoading(true);

      try {
        const filePromises = initialFiles.map((initialFile) => {
          const url = initialFile.imageUrl || initialFile.filePath;
          const name =
            initialFile.imageName ||
            initialFile.fileName ||
            url?.split("/").pop() ||
            "file";

          if (!url) {
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
          ).catch((err) => {
            console.error("파일 로드 실패:", url, err);
            return null;
          });
        });

        const loadedFiles = (await Promise.all(filePromises)).filter(
          Boolean,
        ) as File[];

        if (isCancelled || hasUserModifiedRef.current) return;

        const initialManagedFiles: ManagedFile[] = loadedFiles.map((file) => ({
          file,
          ...(isImageFile(file) && { preview: URL.createObjectURL(file) }),
        }));

        setFiles(initialManagedFiles);
        isInitializedRef.current = true;
      } finally {
        if (!isCancelled) {
          setIsFileLoading(false);
        }
      }
    };

    setInitialData();

    return () => {
      isCancelled = true;
    };
  }, [initialFilesKey]);

  // 3. 파일 추가 로직
  const addFiles = useCallback(
    (newFiles: FileList) => {
      hasUserModifiedRef.current = true;
      const filesArray = Array.from(newFiles);
      const maxSizeInBytes = maxSizeMB * 1024 * 1024;

      if (files.length + filesArray.length > maxCount) {
        alert(`파일은 최대 ${maxCount}개까지 첨부할 수 있습니다.`);
        return;
      }

      if (mode === "image") {
        const nonImageFiles = filesArray.filter((file) => !isImageFile(file));
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
        file,
        ...(isImageFile(file) && { preview: URL.createObjectURL(file) }),
      }));

      setFiles((prev) => [...prev, ...newManagedFiles]);
    },
    [files, maxCount, maxSizeMB, mode],
  );

  // 4. 파일 삭제 로직
  const deleteFile = useCallback(
    (indexToDelete: number) => {
      hasUserModifiedRef.current = true;
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
