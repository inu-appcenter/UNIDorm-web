export const DEBUG_LOG_STORAGE_KEY = "debugLogs";
export const DEBUG_LOG_UPDATED_EVENT = "debug-log-updated";
const MAX_DEBUG_LOGS = 500;

export type DebugLogCategory = "token-refresh" | "network" | "system";

export interface DebugLogEntry {
  id: string;
  timestamp: string;
  category: DebugLogCategory;
  action: string;
  details?: Record<string, unknown>;
}

interface AppendDebugLogParams {
  category: DebugLogCategory;
  action: string;
  details?: Record<string, unknown>;
}

const parseDebugLogs = (value: string | null): DebugLogEntry[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistDebugLogs = (logs: DebugLogEntry[]) => {
  localStorage.setItem(DEBUG_LOG_STORAGE_KEY, JSON.stringify(logs));
  window.dispatchEvent(new CustomEvent(DEBUG_LOG_UPDATED_EVENT));
};

export const getDebugLogs = (): DebugLogEntry[] =>
  parseDebugLogs(localStorage.getItem(DEBUG_LOG_STORAGE_KEY));

export const appendDebugLog = ({
  category,
  action,
  details,
}: AppendDebugLogParams) => {
  const nextLog: DebugLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    category,
    action,
    details,
  };

  const logs = [...getDebugLogs(), nextLog].slice(-MAX_DEBUG_LOGS);
  persistDebugLogs(logs);
};

export const clearDebugLogs = () => {
  persistDebugLogs([]);
};

