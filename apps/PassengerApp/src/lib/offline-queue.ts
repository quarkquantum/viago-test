import { StorageKeys, storage } from './storage';

export type QueuedActionType = 'CREATE_BOOKING';

export type CreateBookingPayload = {
  fromStationId: string;
  toStationId: string;
  tripId: string;
  seatId?: string;
};

export type QueuedAction = {
  id: string;
  type: QueuedActionType;
  payload: CreateBookingPayload;
  createdAt: number;
};

function getQueue(): QueuedAction[] {
  try {
    const raw = storage.getString(StorageKeys.OFFLINE_QUEUE);
    if (raw) {
      return JSON.parse(raw) as QueuedAction[];
    }
  } catch {
    storage.remove(StorageKeys.OFFLINE_QUEUE);
  }

  return [];
}

function saveQueue(queue: QueuedAction[]): void {
  storage.set(StorageKeys.OFFLINE_QUEUE, JSON.stringify(queue));
}

export function enqueue(action: Omit<QueuedAction, 'id' | 'createdAt'>): QueuedAction {
  const queue = getQueue();
  const queuedAction: QueuedAction = {
    ...action,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
  };

  queue.push(queuedAction);
  saveQueue(queue);
  return queuedAction;
}

export function peekQueue(): QueuedAction[] {
  return getQueue();
}

export function removeFromQueue(id: string): void {
  const queue = getQueue().filter((item) => item.id !== id);
  saveQueue(queue);
}

export function queueLength(): number {
  return getQueue().length;
}
