import type { DetectionHistory } from "@/types/api";
import { authClient } from "@/lib/auth/client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function authHeaders(): HeadersInit {
  const token = authClient.getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

// ============================================================
// IMAGE DETECTION
// ============================================================

export async function uploadImage(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict/`, {
    method: "POST",
    body: formData,
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Image detection failed");
  }

  return response.json();
}

// ============================================================
// VIDEO DETECTION
// ============================================================

export async function uploadVideo(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict/video`, {
    method: "POST",
    body: formData,
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Video detection failed");
  }

  return response.json();
}

// ============================================================
// LIVE CAMERA
// ============================================================

export async function uploadCameraFrame(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/predict/camera`, {
    method: "POST",
    body: formData,
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error("Camera detection failed");
  }

  return response.json();
}

// ============================================================
// HISTORY
// ============================================================

export async function getHistory(): Promise<DetectionHistory[]> {
  const response = await fetch(
    `${API_BASE_URL}/predict/history`,
    {
      headers: authHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load history");
  }

  return response.json();
}

// ============================================================
// CLEAR HISTORY
// ============================================================

export async function clearHistory() {
  const response = await fetch(
    `${API_BASE_URL}/predict/history`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to clear history");
  }

  return response.json();
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboardStats() {
  const response = await fetch(
    `${API_BASE_URL}/predict/dashboard`,
    {
      headers: authHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load dashboard statistics");
  }

  return response.json();
}