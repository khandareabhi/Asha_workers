import { getSyncQueue, removeFromSyncQueue, markPatientsClean } from "../db/sqlite";
import NetInfo from "@react-native-community/netinfo";

async function isOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://clients3.google.com/generate_204', { signal: controller.signal });
    clearTimeout(timeout);
    return res && res.status === 204;
  } catch {
    return false;
  }
}

export async function attemptSync(): Promise<void> {
  const online = await isOnline();
  if (!online) return;

  const queue = await getSyncQueue();
  if (queue.length === 0) return;

  // Simulate successful upload to server for all queue items
  const idsToRemove: number[] = [];
  const patientIdsToClean: string[] = [];
  for (const item of queue) {
    if (item.entity === 'patient') {
      patientIdsToClean.push(item.entityId);
    }
    idsToRemove.push(item.id);
  }

  await markPatientsClean(patientIdsToClean);
  await removeFromSyncQueue(idsToRemove);
}

// Start a connectivity listener that attempts sync when we go online
let unsubscribeNetInfo: null | (() => void) = null;
export function startConnectivitySync(): void {
  if (unsubscribeNetInfo) return;
  unsubscribeNetInfo = NetInfo.addEventListener(state => {
    const isConnected = Boolean(state.isConnected && state.isInternetReachable !== false);
    if (isConnected) {
      attemptSync();
    }
  });
}

export function stopConnectivitySync(): void {
  if (unsubscribeNetInfo) {
    unsubscribeNetInfo();
    unsubscribeNetInfo = null;
  }
}


