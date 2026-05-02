import { StorageKeys, storage } from './storage';

export type QueuedActionType = 'START_TRIP' | 'UPDATE_STATION_STATUS';

export type QueuedAction = {
  id: string;
  type: QueuedActionType;
  payload: Record<string, unknown>;
  createdAt: number;
};

function getQueue(): QueuedAction[] {
  try {
    const raw = storage.getString(StorageKeys.OFFLINE_QUEUE);
    if (raw) {
      return JSON.parse(raw) as QueuedAction[];
    }
  } catch {
    // Reset corrupted queue
    storage.remove(StorageKeys.OFFLINE_QUEUE);
  }
  return [];
}

function saveQueue(queue: QueuedAction[]): void {
  storage.set(StorageKeys.OFFLINE_QUEUE, JSON.stringify(queue));
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'createdAt'>): void {
  const queue = getQueue();
  queue.push({
    ...action,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
  });
  saveQueue(queue);
}

export function dequeue(): QueuedAction | undefined {
  const queue = getQueue();
  const item = queue.shift();
  saveQueue(queue);
  return item;
}

export function peekQueue(): QueuedAction[] {
  return getQueue();
}

export function clearQueue(): void {
  storage.remove(StorageKeys.OFFLINE_QUEUE);
}

export function queueLength(): number {
  return getQueue().length;
}
