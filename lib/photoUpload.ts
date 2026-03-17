import { supabase } from "@/lib/supabaseClient";

export const uploadPhoto = async (file: File, bin: string, businessName: string) => {
  const fileExt = file.name.split('.').pop();
  const safeName = businessName.replace(/[^a-zA-Z0-9]/g, '_');
  const filePath = `photos/${bin}_${safeName}.${fileExt}`;

  console.log("📤 [1] uploadPhoto called");
  console.log("   file:", file.name, file.size, file.type);
  console.log("   bin:", bin);
  console.log("   filePath:", filePath);

  const { data, error } = await supabase.storage
    .from('business-photos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  console.log("📤 [2] upload result:", { data, error });

  if (error) {
    console.error('❌ [2] Upload error:', error.message, error);
    return null;
  }

  console.log("✅ [2] Uploaded to bucket:", filePath);
  return filePath;
};

export const getPhotoUrl = (filePath: string) => {
  const { data } = supabase.storage
    .from('business-photos')
    .getPublicUrl(filePath);

  console.log("🔗 [3] Public URL:", data.publicUrl);
  return data.publicUrl;
};

export const saveGeoTagToRecord = async (
  bin: string,
  photoUrl: string,
  location?: { lat: number; lng: number; accuracy: number }
) => {
  console.log("💾 [4] saveGeoTagToRecord called");
  console.log("   bin:", bin);
  console.log("   photoUrl:", photoUrl);
  console.log("   location:", location);

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

  console.log("💾 [4] update result:", { data, error });

  if (error) {
    console.error('❌ [4] Save geo-tag error:', error.message, error);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ [4] Update ran but matched 0 rows — BIN not found:', bin);
    return false;
  }

  console.log("✅ [4] Saved to DB, rows updated:", data.length);
  return true;
};

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

export const handlePhotoAndLocationUpload = async (
  file: File,
  bin: string,
  businessName: string,
  location?: { lat: number; lng: number; accuracy: number }
) => {
  try {
    console.log("🚀 [0] handlePhotoAndLocationUpload called");
    console.log("   bin:", bin);
    console.log("   businessName:", businessName);
    console.log("   location:", location);

    const filePath = await uploadPhoto(file, bin, businessName);
    if (!filePath) {
      console.error("❌ [0] uploadPhoto returned null — stopping");
      return null;
    }

    const photoUrl = getPhotoUrl(filePath);

    const saved = await saveGeoTagToRecord(bin, photoUrl, location);
    if (!saved) {
      console.error("❌ [0] saveGeoTagToRecord returned false — stopping");
      return null;
    }

    console.log("✅ [0] All done. photoUrl:", photoUrl);
    return photoUrl;
  } catch (err) {
    console.error('❌ [0] handlePhotoAndLocationUpload exception:', err);
    return null;
  }
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