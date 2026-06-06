/* Client-side Web Push helpers: permission, subscribe, sync schedule to the backend.
   VAPID public key is injected at build time (VITE_VAPID_PUBLIC_KEY). It is NOT secret. */
export const VAPID_PUBLIC: string =
  (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY ||
  "BFFHRwb-1ymMPqJPzuh6m_43Cf23GhXtiPMxTS0Q7vUJRXiKpwy3Nj72-WzTC03c3CG9xqEh0YF9C6rP1s1jjqE";

export type Reminder = { days: string[]; time: string };

export function pushSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// iOS only delivers Web Push to a PWA added to the home screen (standalone).
export function isStandalone(): boolean {
  return (
    (typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches) ||
    (typeof navigator !== "undefined" && (navigator as any).standalone === true)
  );
}

export function notifPermission(): NotificationPermission | "unsupported" {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

function urlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

// Request permission, (re)subscribe, and push the schedule to the backend.
// Throws "unsupported" | "denied" on failure so the UI can react.
export async function enableReminders(rem: Reminder): Promise<void> {
  if (!pushSupported()) throw new Error("unsupported");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("denied");
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC) as BufferSource,
    });
  }
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ subscription: sub, days: rem.days, time: rem.time, tz }),
  });
  if (!res.ok) throw new Error("server");
}

export async function disableReminders(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    await fetch("/api/unsubscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => {});
  }
}
