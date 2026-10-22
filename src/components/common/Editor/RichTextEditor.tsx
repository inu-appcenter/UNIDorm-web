import { useEffect } from "react";
import styled from "styled-components";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough as StrikeIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "내용을 입력해주세요...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor: currentEditor }) => {
      // 내용이 완전히 비어있을 때는 빈 문자열 전달
      const html = currentEditor.isEmpty ? "" : currentEditor.getHTML();
      onChange(html);
    },
  });

  // 외부 content 변경 시 에디터 동기화 (초기값 설정 등)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // 기존 텍스트가 일반 텍스트(줄바꿈)일 수도 있고 HTML일 수도 있음
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      const formattedContent = isHtml
        ? content
        : content
          ? content
              .split("\n")
              .map((line) => `<p>${line || "<br>"}</p>`)
              .join("")
          : "";

      if (formattedContent !== editor.getHTML()) {
        editor.commands.setContent(formattedContent);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <Container>
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            $isActive={editor.isActive("bold")}
            title="굵게"
          >
            <BoldIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            $isActive={editor.isActive("italic")}
            title="기울임"
          >
            <ItalicIcon size={18} />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            $isActive={editor.isActive("strike")}
            title="취소선"
          >
            <StrikeIcon size={18} />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarButton
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            $isActive={editor.isActive("heading", { level: 2 })}
            title="소제목 (H2)"
          >
            <Heading2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            $isActive={editor.isActive("heading", { level: 3 })}
            title="소제목 (H3)"
          >
            <Heading3 size={18} />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            $isActive={editor.isActive("bulletList")}
            title="글머리 기호 목록"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            $isActive={editor.isActive("orderedList")}
            title="번호 매기기 목록"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            $isActive={editor.isActive("blockquote")}
            title="인용구"
          >
            <Quote size={18} />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="구분선"
          >
            <Minus size={18} />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="실행 취소"
          >
            <Undo2 size={18} />
          </ToolbarButton>
          <ToolbarButton
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="다시 실행"
          >
            <Redo2 size={18} />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>

      <EditorWrapper $minHeight={minHeight}>
        <EditorContent editor={editor} />
      </EditorWrapper>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  overflow: hidden;
  box-sizing: border-box;

  &:focus-within {
    border-color: #007aff;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-bottom: 1px solid #ebebeb;
  background-color: #fcfcfc;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;

  /* 스크롤바 숨기기 (모바일 깔끔함 유지) */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Divider = styled.div`
  width: 1px;
  height: 18px;
  background-color: #e2e2e2;
  margin: 0 4px;
  flex-shrink: 0;
`;

const ToolbarButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: none;
  background-color: ${({ $isActive }) => ($isActive ? "#e9f2ff" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "#007aff" : "#555")};
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: ${({ $isActive }) =>
      $isActive ? "#e0edff" : "#f0f0f0"};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  /* 모바일 터치 영역 확장감 */
  -webkit-tap-highlight-color: transparent;
`;

const EditorWrapper = styled.div<{ $minHeight: string }>`
  padding: 12px 14px;
  min-height: ${({ $minHeight }) => $minHeight};
  cursor: text;

  .tiptap {
    outline: none;
    min-height: ${({ $minHeight }) => $minHeight};
    font-size: 15px;
    line-height: 1.6;
    color: #222;

    /* 플레이스홀더 */
    p.is-editor-empty:first-child::before {
      color: #aaa;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }

    /* 문단 간격 */
    p {
      margin: 0 0 8px 0;
      &:last-child {
        margin-bottom: 0;
      }
    }

    /* 제목 스타일 */
    h2 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 16px 0 8px 0;
      color: #111;
    }

    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 14px 0 6px 0;
      color: #111;
    }

    /* 목록 스타일 */
    ul,
    ol {
      padding-left: 20px;
      margin: 8px 0;
    }

    li {
      margin-bottom: 4px;
    }

    /* 인용구 스타일 */
    blockquote {
      border-left: 3px solid #007aff;
      padding-left: 12px;
      margin: 12px 0;
      color: #666;
      font-style: italic;
    }

    /* 가로선 */
    hr {
      border: none;
      border-top: 1px solid #e2e2e2;
      margin: 16px 0;
    }
  }
`;
