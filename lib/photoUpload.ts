import { supabase } from "@/lib/supabaseClient";

export const uploadPhoto = async (file: File, bin: string, businessName: string, index?: number) => {
  const fileExt = file.name.split('.').pop();
  const safeName = businessName.replace(/[^a-zA-Z0-9]/g, '_');
  const suffix = index !== undefined ? `_${index}` : '';
  const filePath = `photos/${bin}_${safeName}${suffix}_${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('business-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error('❌ Upload error:', error.message);
    return null;
  }

  return filePath;
};

export const getPhotoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('business-photos')
    .getPublicUrl(filePath);
  return data.publicUrl;
};

export const saveGeoTagToRecord = async (
  bin: string,
  photoUrl: string,
  location?: { lat: number; lng: number; accuracy: number }
) => {
  const { data, error } = await supabase
    .from('business_records')
    .update({
      photo: photoUrl,
      latitude: location?.lat?.toString() ?? null,
      longitude: location?.lng?.toString() ?? null,
      accuracy: location?.accuracy?.toString() ?? null,
    })
    .eq('Business Identification Number', bin)
    .select();

  if (error) { console.error('❌ Save geo-tag error:', error.message); return false; }
  if (!data || data.length === 0) { console.warn('⚠️ BIN not found:', bin); return false; }
  return true;
};

export const savePhotoToRecord = async (bin: string, photoUrl: string) => {
  const { error } = await supabase
    .from('business_records')
    .update({ photo: photoUrl })
    .eq('Business Identification Number', bin);
  if (error) { console.error('❌ Save photo error:', error.message); return false; }
  return true;
};

export const deletePhoto = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('business-photos')
    .remove([filePath]);
  if (error) { console.error('❌ Delete error:', error.message); return false; }
  return true;
};

// ── Upload multiple photos, returns comma-separated URLs ─────────────────────
export const handleMultiplePhotosUpload = async (
  files: File[],
  bin: string,
  businessName: string,
  existingPhotoUrls: string[] = [],
  location?: { lat: number; lng: number; accuracy: number }
): Promise<string | null> => {
  try {
    const newUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const filePath = await uploadPhoto(files[i], bin, businessName, existingPhotoUrls.length + i);
      if (!filePath) continue;
      const url = getPhotoUrl(filePath);
      newUrls.push(url);
    }

    if (newUrls.length === 0) return null;

    // Merge with existing URLs
    const allUrls = [...existingPhotoUrls, ...newUrls];
    const combined = allUrls.join(',');

    // Save combined URLs + location to record
    const { data, error } = await supabase
      .from('business_records')
      .update({
        photo: combined,
        latitude: location?.lat?.toString() ?? null,
        longitude: location?.lng?.toString() ?? null,
        accuracy: location?.accuracy?.toString() ?? null,
      })
      .eq('Business Identification Number', bin)
      .select();

    if (error) { console.error('❌ Save multi-photo error:', error.message); return null; }
    if (!data || data.length === 0) { console.warn('⚠️ BIN not found:', bin); return null; }

    return combined;
  } catch (err) {
    console.error('❌ handleMultiplePhotosUpload error:', err);
    return null;
  }
};

// ── Keep original for backwards compatibility ─────────────────────────────────
export const handlePhotoAndLocationUpload = async (
  file: File,
  bin: string,
  businessName: string,
  location?: { lat: number; lng: number; accuracy: number }
) => {
  return handleMultiplePhotosUpload([file], bin, businessName, [], location);
};

export const handlePhotoUpload = async (file: File, bin: string, businessName: string) => {
  try {
    const filePath = await uploadPhoto(file, bin, businessName);
    if (!filePath) return null;
    const photoUrl = getPhotoUrl(filePath);
    const saved = await savePhotoToRecord(bin, photoUrl);
    if (!saved) return null;
    return photoUrl;
  } catch (err) {
    console.error('❌ handlePhotoUpload error:', err);
    return null;
  }
};