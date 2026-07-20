import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react";
import { Drawer } from "vaul";
import styled from "styled-components";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (files: File[]) => Promise<void>;
}

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/gif,image/webp";

export default function PhotoAttachmentBottomSheet({
  open,
  onOpenChange,
  onSend,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview)),
    [previews],
  );

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );
    setFiles((current) => {
      const next = [...current, ...selected];
      if (next.length > 5)
        alert("사진은 한 번에 최대 5장까지 전송할 수 있어요.");
      return next.slice(0, 5);
    });
    event.target.value = "";
  };

  const handleSend = async () => {
    if (!files.length || isSending) return;
    setIsSending(true);
    try {
      await onSend(files);
      setFiles([]);
      onOpenChange(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      repositionInputs={false}
    >
      <Drawer.Portal>
        <Overlay />
        <Content>
          <Handle />
          <Header>
            <div>
              <Drawer.Title>사진 첨부</Drawer.Title>
              <Drawer.Description>
                카메라 / 앨범에서 사진 선택
              </Drawer.Description>
            </div>
            <SendButton
              disabled={!files.length || isSending}
              onClick={handleSend}
            >
              {isSending ? "전송 중" : "전송"}
            </SendButton>
          </Header>

          <PreviewRow>
            <AddPhotoButton
              type="button"
              onClick={() => albumInputRef.current?.click()}
            >
              <ImageIcon size={24} />
            </AddPhotoButton>
            {previews.map((preview, index) => (
              <Preview
                key={`${files[index].name}-${files[index].lastModified}`}
              >
                <img src={preview} alt={`선택한 사진 ${index + 1}`} />
                <RemoveButton
                  type="button"
                  aria-label={`${index + 1}번째 사진 삭제`}
                  onClick={() =>
                    setFiles((current) => current.filter((_, i) => i !== index))
                  }
                >
                  <X size={10} />
                </RemoveButton>
              </Preview>
            ))}
            {Array.from({ length: Math.max(0, 4 - files.length) }).map(
              (_, index) => (
                <EmptyPreview key={index} />
              ),
            )}
          </PreviewRow>

          <SourceMenu>
            <SourceButton
              type="button"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={18} /> 카메라
            </SourceButton>
            <SourceButton
              type="button"
              onClick={() => albumInputRef.current?.click()}
            >
              <ImageIcon size={18} /> 앨범
            </SourceButton>
          </SourceMenu>

          <HiddenInput
            ref={cameraInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            capture="environment"
            onChange={addFiles}
          />
          <HiddenInput
            ref={albumInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
            onChange={addFiles}
          />
        </Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const Overlay = styled(Drawer.Overlay)`
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.4);
`;
const Content = styled(Drawer.Content)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20001;
  max-width: 420px;
  margin: 0 auto;
  padding: 12px 20px 64px;
  box-sizing: border-box;
  border-radius: 16px 16px 0 0;
  background: white;
  outline: none;
`;
const Handle = styled.div`
  width: 60px;
  height: 4px;
  margin: 0 auto 16px;
  border-radius: 4px;
  background: #dfdfdf;
`;
const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  h2 {
    margin: 0;
    color: #3d3d3d;
    font:
      600 20px/1.5 Pretendard,
      sans-serif;
  }
  p {
    margin: 4px 0 0;
    color: #8b8b8b;
    font:
      400 12px/1.5 Pretendard,
      sans-serif;
  }
`;
const SendButton = styled.button`
  border: 0;
  border-radius: 20px;
  padding: 4px 12px;
  background: #1677ff;
  color: white;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;
const PreviewRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
`;
const previewStyle = `width:58px;height:58px;flex:0 0 58px;border-radius:8px;box-sizing:border-box;`;
const AddPhotoButton = styled.button`
  ${previewStyle} border: 0;
  display: grid;
  place-items: center;
  background: #dfdfdf;
  color: #797979;
  cursor: pointer;
`;
const EmptyPreview = styled.div`
  ${previewStyle} background: #efefef;
`;
const Preview = styled.div`
  ${previewStyle} position: relative;
  border: 1px solid #1677ff;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
const RemoveButton = styled.button`
  position: absolute;
  top: 3px;
  right: 3px;
  width: 14px;
  height: 14px;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: #1677ff;
  color: white;
  cursor: pointer;
`;
const SourceMenu = styled.div`
  width: 160px;
  margin-top: 16px;
  padding: 8px 16px;
  box-sizing: border-box;
  border: 1px solid #dfdfdf;
  border-radius: 16px;
  background: white;
`;
const SourceButton = styled.button`
  width: 100%;
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: #3d3d3d;
  font:
    400 14px/1.5 Pretendard,
    sans-serif;
  cursor: pointer;
  & + & {
    border-top: 1px solid #efefef;
  }
`;
const HiddenInput = styled.input`
  display: none;
`;
