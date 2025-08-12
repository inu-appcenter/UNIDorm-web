import styled from "styled-components";
import { MdAttachFile } from "react-icons/md";
import { AnnouncementFile } from "../../types/announcements.ts";

interface AnnounceAttachmentProps {
  attachments: AnnouncementFile[];
}

const AnnounceAttachment = ({ attachments }: AnnounceAttachmentProps) => {
  return (
    <AttachmentListWrapper>
      <LeftArea>
        <MdAttachFile size={20} />
        첨부파일
      </LeftArea>
      <RightArea>
        {attachments.map((file, idx) => (
          <AnnounceAttachmentWrapper key={idx}>
            <a
              href={file.filePath}
              download={file.filePath}
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              첨부파일 {file.fileName}
            </a>
            <FileMeta>({(file.fileSize / 1024).toFixed(1)}KB)</FileMeta>
          </AnnounceAttachmentWrapper>
        ))}
      </RightArea>
    </AttachmentListWrapper>
  );
};

export default AnnounceAttachment;

/* 스타일 */
const AttachmentListWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

const AnnounceAttachmentWrapper = styled.div`
  width: 100%;
  height: fit-content;

  a {
    color: #8e8e93;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FileMeta = styled.span`
  margin-left: 4px;
  font-size: 11px;
  color: #b0b0b0;
`;

const LeftArea = styled.div`
  width: fit-content;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;

  color: #1c1c1e;
`;

const RightArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: end;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 24px;
  letter-spacing: 0.38px;

  color: #8e8e93;
`;
