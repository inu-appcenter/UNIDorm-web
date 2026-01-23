// src/pages/GroupPurchaseWritePage/components/ImageUploader.tsx

import React, { useRef } from "react";
import styled from "styled-components";
import { MdImage } from "react-icons/md";
import { MAX_IMAGE_COUNT } from "@/constants/groupPurchase";

interface ImageUploaderProps {
  images: File[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ImageUploader({
  images,
  onImageChange,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <ImageBox onClick={() => inputRef.current?.click()}>
        <MdImage size={36} color="#888" />
        <span>
          {images.length}/{MAX_IMAGE_COUNT}
        </span>
        {images.map((file, idx) => (
          <img
            key={idx}
            src={URL.createObjectURL(file)}
            alt={`업로드 이미지${idx + 1}`}
            style={{ width: 36, height: 36, borderRadius: 8, marginLeft: 4 }}
          />
        ))}
      </ImageBox>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={onImageChange}
      />
    </>
  );
}

// Style used only by this component
const ImageBox = styled.div`
  width: 100%;
  height: 100px;
  background: #eee;
  border-radius: 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #555;
  font-size: 13px;
  cursor: pointer;
`;
