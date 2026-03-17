import { supabase } from "@/lib/supabaseClient";

// ── Upload photo to bucket ─────────────────────────────────────────────────
export const uploadPhoto = async (file: File, bin: string, businessName: string) => {
  const fileExt = file.name.split('.').pop();
  const safeName = businessName.replace(/[^a-zA-Z0-9]/g, '_'); // sanitize special chars
  const filePath = `photos/${bin}_${safeName}.${fileExt}`;

  const { error } = await supabase.storage
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

// ── Get public URL ─────────────────────────────────────────────────────────
export const getPhotoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('business-photos')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

// ── Save URL to business_records ───────────────────────────────────────────
export const savePhotoToRecord = async (bin: string, photoUrl: string) => {
  const { error } = await supabase
    .from('business_records')
    .update({ photo: photoUrl })
    .eq('Business Identification Number', bin);

  if (error) {
    console.error('❌ Save photo error:', error.message);
    return false;
  }

  return true;
};

// ── Delete photo from bucket ───────────────────────────────────────────────
export const deletePhoto = async (filePath: string) => {
  const { error } = await supabase.storage
    .from('business-photos')
    .remove([filePath]);

  if (error) {
    console.error('❌ Delete error:', error.message);
    return false;
  }

  return true;
};

// ── Full combined function ─────────────────────────────────────────────────
export const handlePhotoUpload = async (file: File, bin: string, businessName: string) => {
  try {
    // Step 1: Upload to bucket
    const filePath = await uploadPhoto(file, bin, businessName);
    if (!filePath) return null;

    // Step 2: Get public URL
    const photoUrl = getPhotoUrl(filePath);

    // Step 3: Save URL to business_records
    const saved = await savePhotoToRecord(bin, photoUrl);
    if (!saved) return null;

    return photoUrl;
  } catch (err) {
    console.error('❌ handlePhotoUpload error:', err);
    return null;
  }
};
