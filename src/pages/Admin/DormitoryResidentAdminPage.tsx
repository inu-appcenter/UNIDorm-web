import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { RefreshCw, Trash2, ExternalLink, Search, ChevronLeft, ChevronRight } from "lucide-react";
import useUserStore from "@/stores/useUserStore";
import { useUserRole } from "@/hooks/useUserRole";
import { useSetHeader } from "@/hooks/useSetHeader";
import DormitoryBadge, { parseDormitoryKind } from "@/components/common/DormitoryBadge";
import PortalConfirmModal from "@/components/portal/PortalConfirmModal";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  fetchAdminDormitoryListFromExtension,
  getPortalExtensionStatusFromBridge,
  isExtensionAgentEnvironment,
  openPortalLoginTabFromBridge,
  PortalExtensionStatus,
} from "@/apis/mobileAgentBridge";
import {
  DormitoryAdminDatasetType,
  DormitoryAdminRecord,
  DormitoryAdminSnapshotMeta,
  formatDormTermLabel,
} from "@/utils/dormitoryAdminParser";
import {
  clearAllDormitoryAdminData,
  deleteDormitorySnapshot,
  getDormitoryRecordsBySnapshot,
  isIndexedDbAvailable,
  listDormitorySnapshots,
  saveDormitorySnapshot,
} from "@/utils/dormitoryAdminDb";
import {
  AdminActionRow,
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminCardDescription,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardTitleGroup,
  AdminEmptyDescription,
  AdminEmptyState,
  AdminEmptyTitle,
  AdminField,
  AdminInput,
  AdminLabel,
  AdminNotice,
  AdminPage,
  AdminSelect,
  AdminSubtleText,
} from "@/pages/Admin/adminPageStyles";

const PAGE_SIZE = 50;

const TERM_OPTIONS = [
  { value: "10", label: "1학기" },
  { value: "20", label: "2학기" },
  { value: "30", label: "여름계절" },
  { value: "40", label: "겨울계절" },
] as const;

const DORM_FILTER_OPTIONS = [
  { value: "", label: "전체 기숙사" },
  { value: "01", label: "제1기숙사" },
  { value: "02", label: "제2기숙사" },
  { value: "03", label: "제2기숙사(BTL)" },
  { value: "04", label: "제3기숙사" },
  { value: "05", label: "제3기숙사(BTL)" },
] as const;

function getDefaultTermCode(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 2 && month <= 6) return "10";
  if (month >= 8 && month <= 12) return "20";
  if (month === 7) return "30";
  return "40";
}

function getYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  return [
    String(currentYear + 1),
    String(currentYear),
    String(currentYear - 1),
    String(currentYear - 2),
  ];
}

function formatSyncedAt(iso?: string): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

function getDatasetLabel(type: DormitoryAdminDatasetType): string {
  return type === "APPLICATION" ? "입사신청 목록" : "사생정보 목록";
}

export default function DormitoryResidentAdminPage() {
  const navigate = useNavigate();
  const { tokenInfo, isLoading: isAuthLoading } = useUserStore();
  const { isAdmin, isSupporters } = useUserRole();

  useSetHeader({ title: "기숙사 사생 목록" });

  // 접근 제어: 서포터즈 제외 전체 관리자만 허용
  useEffect(() => {
    if (!isAuthLoading) {
      if (!tokenInfo.accessToken || !isAdmin || isSupporters) {
        navigate("/home", { replace: true });
      }
    }
  }, [isAuthLoading, tokenInfo.accessToken, isAdmin, isSupporters, navigate]);

  const [extensionReady, setExtensionReady] = useState<boolean>(() =>
    isExtensionAgentEnvironment(),
  );
  const [extStatus, setExtStatus] = useState<PortalExtensionStatus | null>(null);
  const [isCheckingExt, setIsCheckingExt] = useState(false);

  // 조회 조건
  const [datasetType, setDatasetType] = useState<DormitoryAdminDatasetType>("RESIDENT");
  const [year, setYear] = useState<string>(() => String(new Date().getFullYear()));
  const [term, setTerm] = useState<string>(() => getDefaultTermCode());
  const [dormGbn, setDormGbn] = useState<string>("");

  // 로컬 IndexedDB 스냅샷 및 레코드 상태
  const [snapshots, setSnapshots] = useState<DormitoryAdminSnapshotMeta[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>("");
  const [records, setRecords] = useState<DormitoryAdminRecord[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 알림/에러 메시지
  const [notice, setNotice] = useState<{
    tone: "error" | "success";
    message: string;
  } | null>(null);

  // 목록 검색 및 필터
  const [searchKeyword, setSearchKeyword] = useState("");
  const [dormKindFilter, setDormKindFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태
  const [selectedRecord, setSelectedRecord] = useState<DormitoryAdminRecord | null>(
    null,
  );
  const [confirmModal, setConfirmModal] = useState<{
    type: "DELETE_SNAPSHOT" | "CLEAR_ALL";
  } | null>(null);

  const yearOptions = useMemo(() => getYearOptions(), []);

  const refreshExtensionStatus = useCallback(async () => {
    const installed = isExtensionAgentEnvironment();
    setExtensionReady(installed);
    if (!installed) {
      setExtStatus(null);
      return;
    }
    setIsCheckingExt(true);
    try {
      const res = await getPortalExtensionStatusFromBridge();
      if (res.success && res.data) {
        setExtStatus(res.data);
      } else {
        setExtStatus(null);
      }
    } finally {
      setIsCheckingExt(false);
    }
  }, []);

  const loadSnapshotList = useCallback(async (preferSnapshotId?: string) => {
    if (!isIndexedDbAvailable()) {
      setIsDbLoading(false);
      setNotice({
        tone: "error",
        message: "이 브라우저에서는 IndexedDB 로컬 저장소를 사용할 수 없어요.",
      });
      return;
    }

    setIsDbLoading(true);
    try {
      const list = await listDormitorySnapshots();
      setSnapshots(list);

      const nextId =
        (preferSnapshotId && list.some((s) => s.id === preferSnapshotId)
          ? preferSnapshotId
          : list[0]?.id) || "";

      setSelectedSnapshotId(nextId);
      if (nextId) {
        const rows = await getDormitoryRecordsBySnapshot(nextId);
        setRecords(rows);
      } else {
        setRecords([]);
      }
    } catch (err: unknown) {
      setNotice({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "로컬에 저장된 목록을 불러오지 못했어요.",
      });
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshExtensionStatus();
    void loadSnapshotList();

    const handleReady = () => {
      void refreshExtensionStatus();
    };
    window.addEventListener("unidormExtensionReady", handleReady);
    return () => {
      window.removeEventListener("unidormExtensionReady", handleReady);
    };
  }, [refreshExtensionStatus, loadSnapshotList]);

  const handleSelectSnapshot = useCallback(async (snapshotId: string) => {
    setSelectedSnapshotId(snapshotId);
    setSearchKeyword("");
    setDormKindFilter("ALL");
    setStatusFilter("ALL");
    setCurrentPage(1);

    if (!snapshotId) {
      setRecords([]);
      return;
    }
    setIsDbLoading(true);
    try {
      const rows = await getDormitoryRecordsBySnapshot(snapshotId);
      setRecords(rows);
    } catch (err: unknown) {
      setNotice({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "선택한 스냅샷 데이터를 읽지 못했어요.",
      });
    } finally {
      setIsDbLoading(false);
    }
  }, []);

  const handleOpenPortalLogin = useCallback(async () => {
    const res = await openPortalLoginTabFromBridge();
    if (!res.success) {
      window.open(
        "https://portal.inu.ac.kr:444/enview/user/login.face",
        "_blank",
        "noopener,noreferrer",
      );
    }
  }, []);

  const handleFetchFromPortal = useCallback(async () => {
    setNotice(null);
    setIsSyncing(true);
    try {
      const res = await fetchAdminDormitoryListFromExtension({
        datasetType,
        yy: year,
        tmGbn: term,
        dormGbn,
      });

      if (!res.success || !res.data) {
        setNotice({
          tone: "error",
          message:
            res.errorMessage ||
            "포털에서 목록을 가져오지 못했어요. ERP 로그인 상태를 확인해 주세요.",
        });
        return;
      }

      const { meta, records: fetchedRecords, erpSession } = res.data;
      await saveDormitorySnapshot(meta, fetchedRecords);
      await loadSnapshotList(meta.id);
      setSearchKeyword("");
      setDormKindFilter("ALL");
      setStatusFilter("ALL");
      setCurrentPage(1);

      const roleSuffix = erpSession.userGbnNm
        ? ` (${erpSession.userGbnNm})`
        : "";
      setNotice({
        tone: "success",
        message: `${getDatasetLabel(datasetType)} ${fetchedRecords.length.toLocaleString()}건을 로컬 IndexedDB에 저장했어요${roleSuffix}.`,
      });
    } catch (err: unknown) {
      setNotice({
        tone: "error",
        message:
          err instanceof Error
            ? err.message
            : "로컬 저장 중 오류가 발생했어요.",
      });
    } finally {
      setIsSyncing(false);
      void refreshExtensionStatus();
    }
  }, [datasetType, year, term, dormGbn, loadSnapshotList, refreshExtensionStatus]);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmModal) return;
    setNotice(null);
    try {
      if (confirmModal.type === "DELETE_SNAPSHOT" && selectedSnapshotId) {
        await deleteDormitorySnapshot(selectedSnapshotId);
        await loadSnapshotList();
        setNotice({
          tone: "success",
          message: "선택한 로컬 스냅샷을 삭제했어요.",
        });
      } else if (confirmModal.type === "CLEAR_ALL") {
        await clearAllDormitoryAdminData();
        setSnapshots([]);
        setSelectedSnapshotId("");
        setRecords([]);
        setNotice({
          tone: "success",
          message: "로컬 IndexedDB에 저장된 기숙사 목록을 모두 비웠어요.",
        });
      }
    } catch (err: unknown) {
      setNotice({
        tone: "error",
        message:
          err instanceof Error ? err.message : "삭제 중 오류가 발생했어요.",
      });
    } finally {
      setConfirmModal(null);
    }
  }, [confirmModal, selectedSnapshotId, loadSnapshotList]);

  const activeSnapshot = useMemo(
    () => snapshots.find((s) => s.id === selectedSnapshotId) || null,
    [snapshots, selectedSnapshotId],
  );

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of records) {
      const value =
        activeSnapshot?.datasetType === "APPLICATION"
          ? r.applyStatus
          : r.residentStatus;
      if (value) set.add(value);
    }
    return Array.from(set).sort();
  }, [records, activeSnapshot?.datasetType]);

  const filteredRecords = useMemo(() => {
    const kw = searchKeyword.trim().toLowerCase();
    return records.filter((item) => {
      if (dormKindFilter !== "ALL") {
        const kind = parseDormitoryKind(item.dormitoryTypeName || item.dormitoryType);
        if (kind !== dormKindFilter) return false;
      }

      if (statusFilter !== "ALL") {
        const currentStatus =
          activeSnapshot?.datasetType === "APPLICATION"
            ? item.applyStatus
            : item.residentStatus;
        if (currentStatus !== statusFilter) return false;
      }

      if (kw) {
        const haystack = [
          item.studentId,
          item.name,
          item.departmentName,
          item.collegeName,
          item.roomNumber,
          item.studentDormNo,
          item.dormitoryTypeName,
          item.phoneNumber,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }

      return true;
    });
  }, [records, searchKeyword, dormKindFilter, statusFilter, activeSnapshot?.datasetType]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, safePage]);

  const isStudentSnapshot =
    Boolean(activeSnapshot?.erpUserGbn === "01") ||
    Boolean(activeSnapshot?.erpRoleName?.startsWith("학생"));

  return (
    <PageRoot>
      <AdminPage>
        {/* 1. 크롬 익스텐션 및 ERP 세션 상태 */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardTitle>포털 기숙사 목록 불러오기</AdminCardTitle>
              <AdminCardDescription>
                생활원 관리자 계정으로 인천대 ERP에 로그인한 PC 크롬에서 사생정보와 입사신청 목록을 로컬 IndexedDB에 불러와 확인해요.
              </AdminCardDescription>
            </AdminCardTitleGroup>
            <StatusBadgeGroup>
              <AdminBadge $tone={extensionReady ? "green" : "red"}>
                {extensionReady ? "확장 프로그램 연결됨" : "확장 프로그램 미설치"}
              </AdminBadge>
              {extensionReady && (
                <AdminBadge $tone={extStatus?.hasBrowserSession ? "blue" : "amber"}>
                  {isCheckingExt
                    ? "세션 확인 중..."
                    : extStatus?.hasBrowserSession
                      ? "포털 세션 활성"
                      : "포털 로그인 필요"}
                </AdminBadge>
              )}
            </StatusBadgeGroup>
          </AdminCardHeader>

          {!extensionReady ? (
            <AdminNotice $tone="error">
              UNIDorm 포털 연동 크롬 확장 프로그램이 감지되지 않았어요. PC 크롬 브라우저에서 확장 프로그램을 설치·활성화한 뒤 새로고침해 주세요.
            </AdminNotice>
          ) : (
            <DatasetTabRow role="tablist" aria-label="조회 대상 선택">
              <DatasetTabButton
                type="button"
                role="tab"
                aria-selected={datasetType === "RESIDENT"}
                $selected={datasetType === "RESIDENT"}
                onClick={() => setDatasetType("RESIDENT")}
              >
                사생정보 목록 (findDmty209List)
              </DatasetTabButton>
              <DatasetTabButton
                type="button"
                role="tab"
                aria-selected={datasetType === "APPLICATION"}
                $selected={datasetType === "APPLICATION"}
                onClick={() => setDatasetType("APPLICATION")}
              >
                입사신청 목록 (findDmty101List)
              </DatasetTabButton>
            </DatasetTabRow>
          )}

          <ConditionGrid>
            <AdminField>
              <AdminLabel htmlFor="admin-dorm-year">학년도</AdminLabel>
              <AdminSelect
                id="admin-dorm-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={isSyncing}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField>
              <AdminLabel htmlFor="admin-dorm-term">학기</AdminLabel>
              <AdminSelect
                id="admin-dorm-term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                disabled={isSyncing}
              >
                {TERM_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>

            <AdminField>
              <AdminLabel htmlFor="admin-dorm-gbn">기숙사 구분 (선택)</AdminLabel>
              <AdminSelect
                id="admin-dorm-gbn"
                value={dormGbn}
                onChange={(e) => setDormGbn(e.target.value)}
                disabled={isSyncing || datasetType === "APPLICATION"}
              >
                {DORM_FILTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </AdminSelect>
            </AdminField>
          </ConditionGrid>

          <AdminActionRow>
            <AdminButton
              type="button"
              $tone="primary"
              disabled={!extensionReady || isSyncing}
              onClick={handleFetchFromPortal}
            >
              <RefreshCw size={16} />
              {isSyncing
                ? "포털에서 불러오는 중..."
                : `${getDatasetLabel(datasetType)} 불러오기`}
            </AdminButton>

            <AdminButton
              type="button"
              $tone="secondary"
              disabled={isSyncing}
              onClick={handleOpenPortalLogin}
            >
              <ExternalLink size={16} />
              인천대 포털 로그인 열기
            </AdminButton>

            <AdminButton
              type="button"
              $tone="ghost"
              disabled={isSyncing}
              onClick={() => void refreshExtensionStatus()}
            >
              연결 상태 다시 확인
            </AdminButton>
          </AdminActionRow>

          {notice && <AdminNotice $tone={notice.tone}>{notice.message}</AdminNotice>}
        </AdminCard>

        {/* 2. 로컬 IndexedDB 스냅샷 및 목록 테이블 */}
        <AdminCard>
          <AdminCardHeader>
            <AdminCardTitleGroup>
              <AdminCardTitle>로컬 저장 목록 (IndexedDB)</AdminCardTitle>
              <AdminCardDescription>
                민감정보(주민번호, 계좌번호, 증명사진 원본, 장애등급, 본가 상세주소)는 제외하고 이 브라우저에만 보관해요.
              </AdminCardDescription>
            </AdminCardTitleGroup>

            {snapshots.length > 0 && (
              <SnapshotActionGroup>
                <AdminButton
                  type="button"
                  $tone="danger"
                  disabled={!selectedSnapshotId || isSyncing}
                  onClick={() => setConfirmModal({ type: "DELETE_SNAPSHOT" })}
                >
                  <Trash2 size={15} />
                  현재 스냅샷 삭제
                </AdminButton>
                <AdminButton
                  type="button"
                  $tone="ghost"
                  disabled={isSyncing}
                  onClick={() => setConfirmModal({ type: "CLEAR_ALL" })}
                >
                  전체 비우기
                </AdminButton>
              </SnapshotActionGroup>
            )}
          </AdminCardHeader>

          {isDbLoading || isSyncing ? (
            <LoadingBox>
              <LoadingSpinner
                message={
                  isSyncing
                    ? "포털 ERP에서 목록을 불러와 로컬 IndexedDB에 저장하고 있어요..."
                    : "로컬 IndexedDB에서 목록을 읽고 있어요..."
                }
              />
            </LoadingBox>
          ) : snapshots.length === 0 ? (
            <AdminEmptyState>
              <AdminEmptyTitle>아직 불러온 기숙사 목록이 없어요</AdminEmptyTitle>
              <AdminEmptyDescription>
                위에서 학년도와 학기를 고르고 불러오기 버튼을 누르면 이 브라우저의 IndexedDB에 목록이 저장돼요.
              </AdminEmptyDescription>
            </AdminEmptyState>
          ) : (
            <>
              <SnapshotBar>
                <SnapshotSelectWrap>
                  <AdminLabel htmlFor="admin-dorm-snapshot">저장된 스냅샷</AdminLabel>
                  <AdminSelect
                    id="admin-dorm-snapshot"
                    value={selectedSnapshotId}
                    onChange={(e) => void handleSelectSnapshot(e.target.value)}
                  >
                    {snapshots.map((snap) => (
                      <option key={snap.id} value={snap.id}>
                        [{getDatasetLabel(snap.datasetType)}] {snap.year}년{" "}
                        {formatDormTermLabel(snap.term)} · {snap.totalCount.toLocaleString()}건
                        ({formatSyncedAt(snap.syncedAt)})
                      </option>
                    ))}
                  </AdminSelect>
                </SnapshotSelectWrap>

                {activeSnapshot && (
                  <SnapshotMetaRow>
                    <AdminBadge $tone="blue">
                      {getDatasetLabel(activeSnapshot.datasetType)}
                    </AdminBadge>
                    <AdminBadge $tone="slate">
                      총 {activeSnapshot.totalCount.toLocaleString()}건
                    </AdminBadge>
                    {activeSnapshot.erpRoleName && (
                      <AdminBadge $tone={isStudentSnapshot ? "amber" : "green"}>
                        ERP 세션: {activeSnapshot.erpRoleName}
                      </AdminBadge>
                    )}
                    <AdminSubtleText>
                      불러온 시각: {formatSyncedAt(activeSnapshot.syncedAt)}
                    </AdminSubtleText>
                  </SnapshotMetaRow>
                )}
              </SnapshotBar>

              {isStudentSnapshot && (
                <AdminNotice $tone="error">
                  현재 브라우저가 학생 권한 ERP 세션으로 조회되어 본인 이력만 반환되었을 수 있어요. 전체 사생 목록을 보려면 생활원 관리자 계정으로 ERP에 로그인한 뒤 다시 불러와 주세요.
                </AdminNotice>
              )}

              {/* 검색 및 필터 */}
              <FilterToolbar>
                <SearchInputWrap>
                  <SearchIcon aria-hidden="true">
                    <Search size={16} />
                  </SearchIcon>
                  <SearchInputWithIcon
                    type="text"
                    placeholder="학번, 성명, 학과, 호실, 사생번호로 검색..."
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </SearchInputWrap>

                <FilterSelects>
                  <AdminSelect
                    aria-label="기숙사 필터"
                    value={dormKindFilter}
                    onChange={(e) => {
                      setDormKindFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">기숙사 전체</option>
                    <option value="1기숙사">1기숙사</option>
                    <option value="2기숙사">2기숙사</option>
                    <option value="3기숙사">3기숙사</option>
                    <option value="other">기타/미지정</option>
                  </AdminSelect>

                  <AdminSelect
                    aria-label="상태 필터"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="ALL">상태 전체</option>
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </AdminSelect>
                </FilterSelects>
              </FilterToolbar>

              <ResultSummary>
                검색 결과 <strong>{filteredRecords.length.toLocaleString()}건</strong> / 전체{" "}
                {records.length.toLocaleString()}건 (행을 누르면 상세 정보를 볼 수 있어요)
              </ResultSummary>

              {filteredRecords.length === 0 ? (
                <AdminEmptyState>
                  <AdminEmptyTitle>조건에 맞는 항목이 없어요</AdminEmptyTitle>
                  <AdminEmptyDescription>
                    검색어나 기숙사·상태 필터를 초기화해 보세요.
                  </AdminEmptyDescription>
                  <AdminButton
                    type="button"
                    $tone="secondary"
                    onClick={() => {
                      setSearchKeyword("");
                      setDormKindFilter("ALL");
                      setStatusFilter("ALL");
                      setCurrentPage(1);
                    }}
                  >
                    필터 초기화
                  </AdminButton>
                </AdminEmptyState>
              ) : (
                <>
                  <TableScrollWrap>
                    <DataTable>
                      <thead>
                        <tr>
                          <th>학번</th>
                          <th>성명</th>
                          <th>학과</th>
                          <th>기숙사</th>
                          {activeSnapshot?.datasetType === "APPLICATION" ? (
                            <>
                              <th>신청구분</th>
                              <th>희망호실</th>
                              <th>신청상태</th>
                              <th>신청일</th>
                            </>
                          ) : (
                            <>
                              <th>호실/침대</th>
                              <th>사생번호</th>
                              <th>상태</th>
                              <th>상점/벌점</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRecords.map((row) => (
                          <ClickableRow
                            key={row.uid}
                            onClick={() => setSelectedRecord(row)}
                          >
                            <MonoCell>{row.studentId || "-"}</MonoCell>
                            <NameCell>
                              <span>{row.name || "-"}</span>
                              {row.gender && <GenderTag>{row.gender}</GenderTag>}
                            </NameCell>
                            <EllipsisCell title={row.departmentName}>
                              {row.departmentName || "-"}
                            </EllipsisCell>
                            <td>
                              {row.dormitoryTypeName ? (
                                <DormitoryBadge
                                  dormType={row.dormitoryTypeName}
                                  variant="subtle"
                                  size="sm"
                                />
                              ) : (
                                "-"
                              )}
                            </td>
                            {activeSnapshot?.datasetType === "APPLICATION" ? (
                              <>
                                <td>{row.applyType || "-"}</td>
                                <EllipsisCell title={row.preferredRoomType}>
                                  {row.preferredRoomType || "-"}
                                </EllipsisCell>
                                <td>
                                  {row.applyStatus ? (
                                    <AdminBadge $tone="blue">{row.applyStatus}</AdminBadge>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <MonoCell>{row.applyDate || "-"}</MonoCell>
                              </>
                            ) : (
                              <>
                                <MonoCell>
                                  {row.roomNumber
                                    ? `${row.roomNumber}${row.bedNumber ? `-${row.bedNumber}` : ""}`
                                    : "-"}
                                </MonoCell>
                                <MonoCell>{row.studentDormNo || "-"}</MonoCell>
                                <td>
                                  {row.residentStatus ? (
                                    <AdminBadge
                                      $tone={
                                        row.residentStatus.includes("퇴사")
                                          ? "slate"
                                          : "green"
                                      }
                                    >
                                      {row.residentStatus}
                                    </AdminBadge>
                                  ) : (
                                    "-"
                                  )}
                                </td>
                                <MonoCell>
                                  +{row.meritPoints} / -{row.demeritPoints}
                                </MonoCell>
                              </>
                            )}
                          </ClickableRow>
                        ))}
                      </tbody>
                    </DataTable>
                  </TableScrollWrap>

                  {totalPages > 1 && (
                    <PaginationBar>
                      <AdminButton
                        type="button"
                        $tone="ghost"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={16} />
                        이전
                      </AdminButton>
                      <PageIndicator>
                        {safePage} / {totalPages} 페이지
                      </PageIndicator>
                      <AdminButton
                        type="button"
                        $tone="ghost"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      >
                        다음
                        <ChevronRight size={16} />
                      </AdminButton>
                    </PaginationBar>
                  )}
                </>
              )}
            </>
          )}
        </AdminCard>
      </AdminPage>

      {/* 상세 정보 모달 */}
      <PortalConfirmModal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title={
          selectedRecord
            ? `${selectedRecord.name || "학생"} (${selectedRecord.studentId || "-"})`
            : ""
        }
        primaryButton={{
          text: "닫기",
          onClick: () => setSelectedRecord(null),
          variant: "secondary",
        }}
      >
        {selectedRecord && (
          <DetailList>
            <DetailRow>
              <DetailKey>소속</DetailKey>
              <DetailVal>
                {[
                  selectedRecord.collegeName,
                  selectedRecord.departmentName,
                  selectedRecord.majorName,
                ]
                  .filter(Boolean)
                  .join(" / ") || "-"}
              </DetailVal>
            </DetailRow>
            <DetailRow>
              <DetailKey>학년 · 성별</DetailKey>
              <DetailVal>
                {[selectedRecord.grade, selectedRecord.gender]
                  .filter(Boolean)
                  .join(" · ") || "-"}
              </DetailVal>
            </DetailRow>
            <DetailRow>
              <DetailKey>기숙사</DetailKey>
              <DetailVal>{selectedRecord.dormitoryTypeName || "-"}</DetailVal>
            </DetailRow>
            <DetailRow>
              <DetailKey>연락처</DetailKey>
              <DetailVal>{selectedRecord.phoneNumber || "-"}</DetailVal>
            </DetailRow>
            <DetailRow>
              <DetailKey>이메일</DetailKey>
              <DetailVal>{selectedRecord.email || "-"}</DetailVal>
            </DetailRow>
            {selectedRecord.datasetType === "APPLICATION" ? (
              <>
                <DetailRow>
                  <DetailKey>신청구분 · 상태</DetailKey>
                  <DetailVal>
                    {[selectedRecord.applyType, selectedRecord.applyStatus]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </DetailVal>
                </DetailRow>
                <DetailRow>
                  <DetailKey>입사기간 · 희망호실</DetailKey>
                  <DetailVal>
                    {[selectedRecord.stayPeriod, selectedRecord.preferredRoomType]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </DetailVal>
                </DetailRow>
                <DetailRow>
                  <DetailKey>신청일 · 입사일</DetailKey>
                  <DetailVal>
                    {[selectedRecord.applyDate, selectedRecord.checkInDate]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </DetailVal>
                </DetailRow>
                <DetailRow>
                  <DetailKey>흡연 · 분납</DetailKey>
                  <DetailVal>
                    흡연 {selectedRecord.smokingYn || "-"} · 분납{" "}
                    {selectedRecord.installmentYn || "-"}
                  </DetailVal>
                </DetailRow>
                {selectedRecord.remark && (
                  <DetailRow>
                    <DetailKey>비고</DetailKey>
                    <DetailVal>{selectedRecord.remark}</DetailVal>
                  </DetailRow>
                )}
              </>
            ) : (
              <>
                <DetailRow>
                  <DetailKey>건물 · 호실 · 침대</DetailKey>
                  <DetailVal>
                    {[
                      selectedRecord.dormitoryBuilding,
                      selectedRecord.roomNumber,
                      selectedRecord.bedNumber,
                    ]
                      .filter(Boolean)
                      .join(" / ") || "-"}
                  </DetailVal>
                </DetailRow>
                <DetailRow>
                  <DetailKey>사생번호</DetailKey>
                  <DetailVal>{selectedRecord.studentDormNo || "-"}</DetailVal>
                </DetailRow>
                <DetailRow>
                  <DetailKey>입사일 · 퇴사일</DetailKey>
                  <DetailVal>
                    {[selectedRecord.checkInDate, selectedRecord.checkOutDate]
                      .filter(Boolean)
                      .join(" ~ ") || "-"}
                  </DetailVal>
                </DetailRow>
                <DetailRow>
                  <DetailKey>상점 · 벌점</DetailKey>
                  <DetailVal>
                    상점 {selectedRecord.meritPoints} / 벌점{" "}
                    {selectedRecord.demeritPoints}
                  </DetailVal>
                </DetailRow>
              </>
            )}
          </DetailList>
        )}
      </PortalConfirmModal>

      {/* 삭제 확인 모달 */}
      <PortalConfirmModal
        isOpen={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        title={
          confirmModal?.type === "CLEAR_ALL"
            ? "로컬 기숙사 목록을 모두 비울까요?"
            : "선택한 스냅샷을 삭제할까요?"
        }
        description="이 브라우저의 IndexedDB에 저장된 목록만 삭제되며, 학교 포털 데이터에는 영향을 주지 않아요."
        secondaryButton={{
          text: "취소",
          onClick: () => setConfirmModal(null),
          variant: "secondary",
        }}
        primaryButton={{
          text: confirmModal?.type === "CLEAR_ALL" ? "전체 비우기" : "삭제하기",
          onClick: () => void handleConfirmDelete(),
          variant: "danger",
        }}
      />
    </PageRoot>
  );
}

/* ================= Styled Components ================= */

const PageRoot = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
`;

const StatusBadgeGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DatasetTabRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const DatasetTabButton = styled.button<{ $selected: boolean }>`
  min-height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${({ $selected }) => ($selected ? "#1677ff" : "#e5e8eb")};
  background: ${({ $selected }) => ($selected ? "#e8f3ff" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#0958d9" : "#4e5968")};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);

  &:active {
    transform: scale(0.98);
  }
`;

const ConditionGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
`;

const SnapshotActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const LoadingBox = styled.div`
  padding: 40px 16px;
  display: flex;
  justify-content: center;
`;

const SnapshotBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SnapshotSelectWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SnapshotMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const FilterToolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchInputWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8b95a1;
  display: inline-flex;
  pointer-events: none;
`;

const SearchInputWithIcon = styled(AdminInput)`
  padding-left: 40px;
`;

const FilterSelects = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 768px) {
    width: 300px;
    flex-shrink: 0;
  }
`;

const ResultSummary = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: #6b7684;

  strong {
    color: #191f28;
  }
`;

const TableScrollWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5e8eb;
  border-radius: 14px;
`;

const DataTable = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  font-size: 0.88rem;
  color: #191f28;

  thead th {
    background: #f9fafb;
    color: #4e5968;
    font-weight: 700;
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid #e5e8eb;
    white-space: nowrap;
  }

  tbody td {
    padding: 12px 14px;
    border-bottom: 1px solid #f2f4f6;
    vertical-align: middle;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const ClickableRow = styled.tr`
  cursor: pointer;
  transition: background 0.14s ease;

  &:hover {
    background: #f8fbff;
  }
`;

const MonoCell = styled.td`
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const NameCell = styled.td`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  white-space: nowrap;
`;

const GenderTag = styled.span`
  font-size: 0.74rem;
  font-weight: 600;
  color: #6b7684;
  background: #f2f4f6;
  padding: 2px 6px;
  border-radius: 6px;
`;

const EllipsisCell = styled.td`
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const PageIndicator = styled.span`
  font-size: 0.88rem;
  font-weight: 700;
  color: #4e5968;
  font-variant-numeric: tabular-nums;
`;

const DetailList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f2f4f6;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const DetailKey = styled.span`
  flex-shrink: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: #8b95a1;
`;

const DetailVal = styled.span`
  font-size: 0.86rem;
  font-weight: 600;
  color: #191f28;
  text-align: right;
  word-break: keep-all;
  overflow-wrap: anywhere;
`;
