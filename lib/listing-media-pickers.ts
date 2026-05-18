import * as DocumentPicker from 'expo-document-picker';
import { File as FsFile } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { formatSoiSize } from '@/lib/soi-attachment';

export const LISTING_MAX_PHOTOS = 10;
export const LISTING_PHOTO_MAX_BYTES = 10 * 1024 * 1024;
export const LISTING_MAX_VIDEOS = 3;
export const LISTING_VIDEO_MAX_BYTES = 500 * 1024 * 1024;
export const LISTING_FLOOR_PLAN_MAX_BYTES = 10 * 1024 * 1024;

export type ListingDraftPhoto = {
  id: string;
  uri: string;
  name: string;
  sizeBytes: number;
};

export type ListingDraftVideo = {
  id: string;
  uri: string;
  name: string;
  sizeBytes: number;
};

export type ListingDraftFloorPlan = {
  uri: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
};

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function extFromName(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
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

const PHOTO_MIME_ALLOWED = new Set(['image/jpeg', 'image/png', 'image/heic', 'image/heif']);

function photoMimeFromAsset(asset: ImagePicker.ImagePickerAsset): string | null {
  if (asset.mimeType && PHOTO_MIME_ALLOWED.has(asset.mimeType)) return asset.mimeType;
  const name = asset.fileName ?? '';
  const ext = extFromName(name);
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  return asset.mimeType ?? null;
}

function validatePhoto(asset: ImagePicker.ImagePickerAsset, sizeBytes: number): string | null {
  if (asset.type && asset.type !== 'image') {
    return 'Only still images can be added to property photos.';
  }
  const mime = photoMimeFromAsset(asset);
  if (!mime || !PHOTO_MIME_ALLOWED.has(mime)) {
    return 'Use JPG, PNG, or HEIC photos.';
  }
  if (sizeBytes <= 0) {
    return 'Could not read the photo size. Try another file.';
  }
  if (sizeBytes > LISTING_PHOTO_MAX_BYTES) {
    return `Photos must be at most ${formatSoiSize(LISTING_PHOTO_MAX_BYTES)}. This one is ${formatSoiSize(sizeBytes)}.`;
  }
  return null;
}

const VIDEO_MIME_ALLOWED = new Set(['video/mp4', 'video/quicktime']);

function videoMimeFromAsset(asset: ImagePicker.ImagePickerAsset): string | null {
  if (asset.mimeType && VIDEO_MIME_ALLOWED.has(asset.mimeType)) return asset.mimeType;
  const name = asset.fileName ?? '';
  const ext = extFromName(name);
  if (ext === 'mp4' || ext === 'm4v') return 'video/mp4';
  if (ext === 'mov') return 'video/quicktime';
  return asset.mimeType ?? null;
}

function validateVideo(asset: ImagePicker.ImagePickerAsset, sizeBytes: number): string | null {
  if (asset.type && asset.type !== 'video') {
    return 'Only video files belong in property videos.';
  }
  const mime = videoMimeFromAsset(asset);
  if (!mime || !VIDEO_MIME_ALLOWED.has(mime)) {
    return 'Use MP4 or MOV videos only.';
  }
  if (sizeBytes <= 0) {
    return 'Could not read the video size. Try another file.';
  }
  if (sizeBytes > LISTING_VIDEO_MAX_BYTES) {
    return `Videos must be at most ${formatSoiSize(LISTING_VIDEO_MAX_BYTES)}. This one is ${formatSoiSize(sizeBytes)}.`;
  }
  return null;
}

const FLOOR_EXT_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const FLOOR_MIME_ALLOWED = new Set(Object.values(FLOOR_EXT_TO_MIME));

function inferFloorMime(name: string, reported?: string | null): string {
  const ext = extFromName(name);
  const fromExt = FLOOR_EXT_TO_MIME[ext];
  if (fromExt) return fromExt;
  if (reported && FLOOR_MIME_ALLOWED.has(reported)) return reported;
  return reported ?? 'application/octet-stream';
}

function validateFloorPlan(name: string, mimeType: string, sizeBytes: number): string | null {
  if (sizeBytes <= 0) {
    return 'Could not read the file size. Try another file.';
  }
  if (sizeBytes > LISTING_FLOOR_PLAN_MAX_BYTES) {
    return `Floor plans must be at most ${formatSoiSize(LISTING_FLOOR_PLAN_MAX_BYTES)}. This file is ${formatSoiSize(sizeBytes)}.`;
  }
  if (!FLOOR_MIME_ALLOWED.has(mimeType)) {
    return 'Use a PDF, PNG, or JPG floor plan.';
  }
  return null;
}

async function ensurePhotosPermission(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (Platform.OS === 'web') return { ok: true };
  const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!res.granted) {
    return { ok: false, error: 'Allow photo library access to add listing media.' };
  }
  return { ok: true };
}

async function ensureCameraPermission(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (Platform.OS === 'web') return { ok: true };
  const res = await ImagePicker.requestCameraPermissionsAsync();
  if (!res.granted) {
    return { ok: false, error: 'Allow camera access to capture listing photos and videos.' };
  }
  return { ok: true };
}

async function processPhotosFromAssets(
  assets: ImagePicker.ImagePickerAsset[],
  slotsRemaining: number,
): Promise<PickPhotosResult> {
  const out: ListingDraftPhoto[] = [];
  for (const asset of assets) {
    if (out.length >= slotsRemaining) break;
    const sizeBytes = await resolveSizeBytes(asset.uri, asset.fileSize ?? null, asset.file ?? null);
    const msg = validatePhoto(asset, sizeBytes);
    if (msg) return { ok: false, error: msg };
    out.push({
      id: newId(),
      uri: asset.uri,
      name: asset.fileName?.trim() || 'Photo.jpg',
      sizeBytes,
    });
  }
  return { ok: true, items: out };
}

async function processVideosFromAssets(
  assets: ImagePicker.ImagePickerAsset[],
  slotsRemaining: number,
): Promise<PickVideosResult> {
  const out: ListingDraftVideo[] = [];
  for (const asset of assets) {
    if (out.length >= slotsRemaining) break;
    const sizeBytes = await resolveSizeBytes(asset.uri, asset.fileSize ?? null, asset.file ?? null);
    const msg = validateVideo(asset, sizeBytes);
    if (msg) return { ok: false, error: msg };
    out.push({
      id: newId(),
      uri: asset.uri,
      name: asset.fileName?.trim() || 'Video.mp4',
      sizeBytes,
    });
  }
  return { ok: true, items: out };
}

export type PickPhotosResult =
  | { ok: true; items: ListingDraftPhoto[] }
  | { ok: false; canceled?: true; error?: string };

export type PickVideosResult =
  | { ok: true; items: ListingDraftVideo[] }
  | { ok: false; canceled?: true; error?: string };

export type PickFloorPlanResult =
  | { ok: true; floor: ListingDraftFloorPlan }
  | { ok: false; canceled?: true; error?: string };

export async function pickListingPhotos(slotsRemaining: number): Promise<PickPhotosResult> {
  if (slotsRemaining <= 0) {
    return { ok: false, error: `You've reached the maximum of ${LISTING_MAX_PHOTOS} photos.` };
  }
  const gate = await ensurePhotosPermission();
  if (!gate.ok) return gate;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: slotsRemaining,
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, canceled: true };
  }

  return processPhotosFromAssets(result.assets, slotsRemaining);
}

export async function captureListingPhoto(slotsRemaining: number): Promise<PickPhotosResult> {
  if (slotsRemaining <= 0) {
    return { ok: false, error: `You've reached the maximum of ${LISTING_MAX_PHOTOS} photos.` };
  }
  const gate = await ensureCameraPermission();
  if (!gate.ok) return gate;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, canceled: true };
  }

  return processPhotosFromAssets(result.assets, slotsRemaining);
}

export async function pickListingVideos(slotsRemaining: number): Promise<PickVideosResult> {
  if (slotsRemaining <= 0) {
    return { ok: false, error: `You've reached the maximum of ${LISTING_MAX_VIDEOS} videos.` };
  }
  const gate = await ensurePhotosPermission();
  if (!gate.ok) return gate;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    allowsMultipleSelection: true,
    selectionLimit: slotsRemaining,
    videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
    quality: 1,
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, canceled: true };
  }

  return processVideosFromAssets(result.assets, slotsRemaining);
}

export async function captureListingVideo(slotsRemaining: number): Promise<PickVideosResult> {
  if (slotsRemaining <= 0) {
    return { ok: false, error: `You've reached the maximum of ${LISTING_MAX_VIDEOS} videos.` };
  }
  const cam = await ensureCameraPermission();
  if (!cam.ok) return cam;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['videos'],
    quality: 1,
    videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
  });

  if (result.canceled || !result.assets?.length) {
    return { ok: false, canceled: true };
  }

  return processVideosFromAssets(result.assets, slotsRemaining);
}

export async function pickListingFloorPlan(): Promise<PickFloorPlanResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'image/jpeg', 'image/png'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return { ok: false, canceled: true };
  }

  const asset = result.assets[0];
  if (!asset.uri) {
    return { ok: false, error: 'No file was selected.' };
  }

  const name = asset.name?.trim() || 'floor-plan.pdf';
  const mimeType = inferFloorMime(name, asset.mimeType ?? null);
  const sizeBytes = await resolveSizeBytes(asset.uri, asset.size ?? null, asset.file ?? null);

  const msg = validateFloorPlan(name, mimeType, sizeBytes);
  if (msg) return { ok: false, error: msg };

  return {
    ok: true,
    floor: {
      uri: asset.uri,
      name,
      mimeType,
      sizeBytes,
    },
  };
}
