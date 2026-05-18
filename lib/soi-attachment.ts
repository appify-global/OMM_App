import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File as FsFile } from 'expo-file-system';
import { Platform } from 'react-native';

const STORAGE_KEY = 'omm_soi_attachment_v1';

export const SOI_MAX_BYTES = 25 * 1024 * 1024;

export const SOI_ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export type SoiAttachment = {
  uri: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  attachedAt: string;
};

export function formatSoiSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extFromName(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

const EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

export function inferSoiMime(name: string, reported?: string | null): string {
  const ext = extFromName(name);
  const fromExt = EXT_TO_MIME[ext];
  if (fromExt) return fromExt;
  if (reported && SOI_ALLOWED_MIME.has(reported)) return reported;
  return reported ?? 'application/octet-stream';
}

export function isSoiImageMime(mime: string): boolean {
  return mime.startsWith('image/');
}

export function isSoiPdfMime(mime: string): boolean {
  return mime === 'application/pdf';
}

export function validateSoiFile(name: string, mimeType: string, sizeBytes: number): string | null {
  if (sizeBytes <= 0) {
    return 'Could not read the file size. Try another file.';
  }
  if (sizeBytes > SOI_MAX_BYTES) {
    return `This file is ${formatSoiSize(sizeBytes)}. Maximum size is ${formatSoiSize(SOI_MAX_BYTES)}.`;
  }
  if (!SOI_ALLOWED_MIME.has(mimeType)) {
    return 'Use a PDF or an image (JPEG, PNG, WebP, or HEIC).';
  }
  return null;
}

async function resolveSizeBytes(
  uri: string,
  pickerSize?: number | null,
  webFile?: File | null,
): Promise<number> {
  if (pickerSize != null && pickerSize > 0) return pickerSize;
  if (Platform.OS === 'web' && webFile && webFile.size > 0) return webFile.size;
  try {
    const f = new FsFile(uri);
    if (typeof f.size === 'number' && f.size > 0) return f.size;
  } catch {
    /* ignore */
  }
  if (Platform.OS === 'web' && uri.startsWith('blob:')) {
    try {
      const res = await fetch(uri);
      const blob = await res.blob();
      return blob.size;
    } catch {
      return 0;
    }
  }
  return 0;
}

export type PickSoiResult =
  | { ok: true; attachment: SoiAttachment }
  | { ok: false; canceled: true }
  | { ok: false; error: string };

export async function pickSoiDocument(): Promise<PickSoiResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return { ok: false, canceled: true };
  }

  const asset = result.assets[0];
  if (!asset?.uri) {
    return { ok: false, error: 'No file was selected.' };
  }

  const name = asset.name || 'Statement of Information';
  const mimeType = inferSoiMime(name, asset.mimeType ?? null);
  const sizeBytes = await resolveSizeBytes(asset.uri, asset.size ?? null, asset.file ?? null);
  const err = validateSoiFile(name, mimeType, sizeBytes);
  if (err) {
    return { ok: false, error: err };
  }

  const attachment: SoiAttachment = {
    uri: asset.uri,
    name,
    mimeType,
    sizeBytes,
    attachedAt: new Date().toISOString(),
  };
  await saveSoiAttachment(attachment);
  return { ok: true, attachment };
}

export async function saveSoiAttachment(a: SoiAttachment): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(a));
}

export async function loadSoiAttachment(): Promise<SoiAttachment | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o === null) return null;
    const r = o as Record<string, unknown>;
    if (typeof r.uri !== 'string' || typeof r.name !== 'string') return null;
    return {
      uri: r.uri,
      name: r.name,
      mimeType: typeof r.mimeType === 'string' ? r.mimeType : inferSoiMime(r.name, null),
      sizeBytes: typeof r.sizeBytes === 'number' ? r.sizeBytes : 0,
      attachedAt: typeof r.attachedAt === 'string' ? r.attachedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function clearSoiAttachment(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
