import { AuditLog, UserProfile } from '../types';
import { generateId } from './storage';

export function createAuditLog(
  user: UserProfile,
  action: string,
  details: string
): AuditLog {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  return {
    id: generateId('log'),
    timestamp,
    user: user.name,
    role: user.role,
    action,
    details,
  };
}
