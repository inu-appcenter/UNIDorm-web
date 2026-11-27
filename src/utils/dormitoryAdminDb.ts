import type {
  DormitoryAdminRecord,
  DormitoryAdminSnapshotMeta,
} from "@/utils/dormitoryAdminParser";

const DB_NAME = "unidorm_admin_dormitory_db";
const DB_VERSION = 1;
const STORE_SNAPSHOTS = "snapshots";
const STORE_RECORDS = "records";
const INDEX_BY_SNAPSHOT = "by_snapshotId";

export function isIndexedDbAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDormitoryAdminDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    return Promise.reject(
      new Error("이 브라우저는 IndexedDB 로컬 저장소를 지원하지 않아요."),
    );
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_SNAPSHOTS)) {
        db.createObjectStore(STORE_SNAPSHOTS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        const recordStore = db.createObjectStore(STORE_RECORDS, {
          keyPath: "uid",
        });
        recordStore.createIndex(INDEX_BY_SNAPSHOT, "snapshotId", {
          unique: false,
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        request.error || new Error("로컬 IndexedDB를 여는 중 오류가 발생했어요."),
      );
  });
}

function runTransactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error || new Error("IndexedDB 트랜잭션 처리에 실패했어요."));
    tx.onabort = () =>
      reject(tx.error || new Error("IndexedDB 트랜잭션이 중단되었어요."));
  });
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () =>
      reject(req.error || new Error("IndexedDB 요청 처리에 실패했어요."));
  });
}

/**
 * 동일 snapshotId의 기존 레코드를 제거한 뒤 새 스냅샷과 레코드를 단일 트랜잭션으로 교체 저장합니다.
 */
export async function saveDormitorySnapshot(
  meta: DormitoryAdminSnapshotMeta,
  records: DormitoryAdminRecord[],
): Promise<void> {
  const db = await openDormitoryAdminDb();
  try {
    const tx = db.transaction([STORE_SNAPSHOTS, STORE_RECORDS], "readwrite");
    const snapshotStore = tx.objectStore(STORE_SNAPSHOTS);
    const recordStore = tx.objectStore(STORE_RECORDS);
    const index = recordStore.index(INDEX_BY_SNAPSHOT);

    const existingKeys = await requestToPromise(
      index.getAllKeys(IDBKeyRange.only(meta.id)),
    );
    for (const key of existingKeys) {
      recordStore.delete(key);
    }

    snapshotStore.put(meta);
    for (const record of records) {
      recordStore.put(record);
    }

    await runTransactionDone(tx);
  } finally {
    db.close();
  }
}

/**
 * 저장된 모든 스냅샷 메타데이터를 최신 동기화순으로 반환합니다.
 */
export async function listDormitorySnapshots(): Promise<
  DormitoryAdminSnapshotMeta[]
> {
  const db = await openDormitoryAdminDb();
  try {
    const tx = db.transaction(STORE_SNAPSHOTS, "readonly");
    const store = tx.objectStore(STORE_SNAPSHOTS);
    const all = await requestToPromise<DormitoryAdminSnapshotMeta[]>(
      store.getAll(),
    );
    return all.sort((a, b) => b.syncedAt.localeCompare(a.syncedAt));
  } finally {
    db.close();
  }
}

/**
 * 특정 스냅샷에 속한 모든 사생/입사신청 레코드를 반환합니다.
 */
export async function getDormitoryRecordsBySnapshot(
  snapshotId: string,
): Promise<DormitoryAdminRecord[]> {
  const db = await openDormitoryAdminDb();
  try {
    const tx = db.transaction(STORE_RECORDS, "readonly");
    const store = tx.objectStore(STORE_RECORDS);
    const index = store.index(INDEX_BY_SNAPSHOT);
    const rows = await requestToPromise<DormitoryAdminRecord[]>(
      index.getAll(IDBKeyRange.only(snapshotId)),
    );
    return rows.sort((a, b) => a.studentId.localeCompare(b.studentId));
  } finally {
    db.close();
  }
}

/**
 * 특정 스냅샷과 해당 스냅샷의 모든 레코드를 삭제합니다.
 */
export async function deleteDormitorySnapshot(
  snapshotId: string,
): Promise<void> {
  const db = await openDormitoryAdminDb();
  try {
    const tx = db.transaction([STORE_SNAPSHOTS, STORE_RECORDS], "readwrite");
    const snapshotStore = tx.objectStore(STORE_SNAPSHOTS);
    const recordStore = tx.objectStore(STORE_RECORDS);
    const index = recordStore.index(INDEX_BY_SNAPSHOT);

    const keys = await requestToPromise(
      index.getAllKeys(IDBKeyRange.only(snapshotId)),
    );
    for (const key of keys) {
      recordStore.delete(key);
    }
    snapshotStore.delete(snapshotId);

    await runTransactionDone(tx);
  } finally {
    db.close();
  }
}

/**
 * 로컬 IndexedDB에 저장된 모든 사생/입사신청 스냅샷과 레코드를 초기화합니다.
 */
export async function clearAllDormitoryAdminData(): Promise<void> {
  const db = await openDormitoryAdminDb();
  try {
    const tx = db.transaction([STORE_SNAPSHOTS, STORE_RECORDS], "readwrite");
    tx.objectStore(STORE_SNAPSHOTS).clear();
    tx.objectStore(STORE_RECORDS).clear();
    await runTransactionDone(tx);
  } finally {
    db.close();
  }
}
