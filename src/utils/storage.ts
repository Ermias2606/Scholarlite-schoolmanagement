import { AppData, SchoolClass, Settings } from '../types';
import { DEFAULT_APP_DATA } from './defaultData';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase';

export const DB_STORAGE_KEY = 'ScholarLite_DB_v8';
export const CURRENT_USER_KEY = 'ScholarLite_CurrentUser_v8';

// Add OperationType and handleFirestoreError to comply with rules
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function loadAppDataFromCloud(): Promise<AppData> {
  const path = 'schools/default_school';
  try {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppData;
    } else {
      await setDoc(docRef, DEFAULT_APP_DATA);
      return DEFAULT_APP_DATA;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return DEFAULT_APP_DATA;
  }
}

export async function saveAppDataToCloud(data: AppData): Promise<void> {
  const path = 'schools/default_school';
  try {
    const docRef = doc(db, path);
    await setDoc(docRef, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export function loadAppData(): AppData {

  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      saveAppData(DEFAULT_APP_DATA);
      return DEFAULT_APP_DATA;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.settings || !Array.isArray(parsed.classes)) {
      saveAppData(DEFAULT_APP_DATA);
      return DEFAULT_APP_DATA;
    }
    // Migration safety for users, auditLogs, events, and levels
    if (!Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = DEFAULT_APP_DATA.users;
    } else {
      parsed.users = parsed.users.map((u: any, idx: number) => {
        const defaultMatch = DEFAULT_APP_DATA.users.find((d) => d.id === u.id);
        return {
          ...u,
          roles: Array.isArray(u.roles) ? u.roles : [u.role || 'student'],
          username: u.username || defaultMatch?.username || `user_${u.role}_${idx + 1}`,
          password: u.password || defaultMatch?.password || 'password123',
          email: u.email || defaultMatch?.email,
        };
      });
    }
    if (!Array.isArray(parsed.auditLogs)) {
      parsed.auditLogs = DEFAULT_APP_DATA.auditLogs;
    }
    if (!Array.isArray(parsed.events)) {
      parsed.events = DEFAULT_APP_DATA.events || [];
    }
    if (!Array.isArray(parsed.levels)) {
      parsed.levels = DEFAULT_APP_DATA.levels || [];
    }
    return parsed as AppData;
  } catch (err) {
    console.error('Error loading data from localStorage, resetting to default', err);
    saveAppData(DEFAULT_APP_DATA);
    return DEFAULT_APP_DATA;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save data to localStorage', err);
  }
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
}

export function exportBackupJSON(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `ScholarLite_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function parseAndValidateBackupJSON(jsonStr: string): AppData {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON structure.');
  }
  if (!parsed.settings || typeof parsed.settings.name !== 'string' || !Array.isArray(parsed.settings.semesters)) {
    throw new Error('Backup is missing valid school settings or semesters configuration.');
  }
  if (!Array.isArray(parsed.classes)) {
    throw new Error('Backup is missing classes array.');
  }
  return parsed as AppData;
}
