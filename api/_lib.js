// Shared helpers for the reminder API: Upstash Redis store + VAPID-configured web-push.
import { Redis } from "@upstash/redis";
import webpush from "web-push";

// Works with either the Vercel KV integration (KV_REST_API_*) or raw Upstash (UPSTASH_*).
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

export const SET_KEY = "elan:reminders"; // set of subscription ids
export const recKey = (id) => `elan:rem:${id}`;

// stable id from the subscription endpoint
export function endpointId(endpoint) {
  let h = 0;
  for (let i = 0; i < endpoint.length; i++) h = (Math.imul(31, h) + endpoint.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + ":" + endpoint.length.toString(36);
}

let configured = false;
export function configurePush() {
  if (configured) return;
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:dylandareaupro@gmail.com";
  if (pub && priv) {
    webpush.setVapidDetails(subject, pub, priv);
    configured = true;
  }
}

export { webpush };

export async function readBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}
