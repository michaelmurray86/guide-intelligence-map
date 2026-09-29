import { supabase } from "@/lib/supabase";

const BUCKET = "guide-notes";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function uploadGuideNotePhotos(
  noteId: number,
  files: File[]
): Promise<string[] | null> {
  if (files.length === 0) return [];

  const uploadedPaths: string[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      console.error("Unsupported guide note photo type:", file.type);
      await deleteGuideNotePhotos(uploadedPaths);
      return null;
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      (file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]);

    const path = `${noteId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error(
        "Error uploading guide note photo:",
        JSON.stringify(error, null, 2)
      );
      await deleteGuideNotePhotos(uploadedPaths);
      return null;
    }

    uploadedPaths.push(path);
  }

  return uploadedPaths;
}

export async function deleteGuideNotePhotos(
  paths: string[]
): Promise<boolean> {
  const storagePaths = paths.filter(
    path => path && !path.startsWith("http")
  );

  if (storagePaths.length === 0) return true;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove(storagePaths);

  if (error) {
    console.error(
      "Error deleting guide note photos:",
      JSON.stringify(error, null, 2)
    );
    return false;
  }

  return true;
}

export async function getGuideNotePhotoUrls(
  photos: string[] = []
): Promise<string[]> {
  const storagePaths = photos.filter(
    photo => photo && !photo.startsWith("http")
  );

  const legacyUrls = photos.filter(
    photo => photo && photo.startsWith("http")
  );

  if (storagePaths.length === 0) {
    return legacyUrls;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(storagePaths, SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    console.error(
      "Error creating guide note photo URLs:",
      JSON.stringify(error, null, 2)
    );
    return legacyUrls;
  }

  const signedUrls = (data ?? [])
    .map(item => item.signedUrl)
    .filter((url): url is string => Boolean(url));

  return [...legacyUrls, ...signedUrls];
}
