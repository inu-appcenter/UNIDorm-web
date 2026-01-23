import { useState, useEffect } from "react";
import styled from "styled-components";
import {
  getFeatureFlags,
  createFeatureFlag,
  updateFeatureFlag,
  FeatureFlag,
} from "@/apis/featureFlag";
import { useSetHeader } from "@/hooks/useSetHeader";

// 인터페이스 정의
interface BadgeProps {
  isActive: boolean;
}

// 스타일 정의
const Container = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

const ContentBox = styled.div`
  max-width: 1024px;
  margin: 0 auto;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const PrimaryButton = styled.button`
  background-color: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

// PC 테이블 스타일
const DesktopTable = styled.table`
  display: none;
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  @media (min-width: 768px) {
    display: table;
  }
`;

const Th = styled.th`
  background-color: #f3f4f6;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  text-transform: uppercase;
`;

const Td = styled.td`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
`;

// 모바일 리스트 스타일
const MobileList = styled.div`
  display: block;
  divide-y: 1px solid #e5e7eb;

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileItem = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
  }
`;

const Badge = styled.span<BadgeProps>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background-color: ${(props) => (props.isActive ? "#dcfce7" : "#fee2e2")};
  color: ${(props) => (props.isActive ? "#166534" : "#991b1b")};
`;

// 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
`;

const ModalContent = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  width: 100%;
  max-width: 400px;
`;

const InputGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
  }
`;

const FeatureFlagManagePage = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlag, setNewFlag] = useState<FeatureFlag>({ key: "", flag: false });

  // 데이터 로드
  const fetchFlags = async () => {
    try {
      const { data } = await getFeatureFlags();
      setFlags(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  // 토글 처리
  const handleToggle = async (item: FeatureFlag) => {
    try {
      const updated = { ...item, flag: !item.flag };
      await updateFeatureFlag(updated);
      setFlags(flags.map((f) => (f.key === item.key ? updated : f)));
    } catch (error) {
      alert("변경 실패");
    }
  };

  // 생성 처리
  const handleCreate = async () => {
    if (!newFlag.key) return;
    try {
      const res = await createFeatureFlag(newFlag);
      console.log(res);
      setIsModalOpen(false);
      setNewFlag({ key: "", flag: false });
      fetchFlags();
    } catch (error) {
      alert("생성 실패");
    }
  };

  useSetHeader({ title: "Feature Flag 관리" });

  return (
    <Container>
      <ContentBox>
        <Header>
          <Title>기능 플래그 관리</Title>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            신규 생성
          </PrimaryButton>
        </Header>

        <TableCard>
          {/* PC 뷰 */}
          <DesktopTable>
            <thead>
              <tr>
                <Th>키 이름</Th>
                <Th>상태</Th>
                <Th style={{ textAlign: "right" }}>관리</Th>
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f.key}>
                  <Td>{f.key}</Td>
                  <Td>
                    <Badge isActive={f.flag}>
                      {f.flag ? "활성" : "비활성"}
                    </Badge>
                  </Td>
                  <Td style={{ textAlign: "right" }}>
                    <button onClick={() => handleToggle(f)}>전환</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </DesktopTable>

          {/* 모바일 뷰 */}
          <MobileList>
            {flags.map((f) => (
              <MobileItem key={f.key}>
                <div>
                  <div style={{ fontWeight: 600 }}>{f.key}</div>
                  <Badge isActive={f.flag}>{f.flag ? "ON" : "OFF"}</Badge>
                </div>
                <PrimaryButton onClick={() => handleToggle(f)}>
                  변경
                </PrimaryButton>
              </MobileItem>
            ))}
          </MobileList>
        </TableCard>
      </ContentBox>

      {/* 모달 */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <h3>새 플래그 등록</h3>
            <InputGroup>
              <label>플래그 키</label>
              <input
                type="text"
                value={newFlag.key}
                onChange={(e) =>
                  setNewFlag({ ...newFlag, key: e.target.value })
                }
              />
            </InputGroup>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <PrimaryButton onClick={handleCreate} style={{ flex: 1 }}>
                저장
              </PrimaryButton>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>
                취소
              </button>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default FeatureFlagManagePage;
