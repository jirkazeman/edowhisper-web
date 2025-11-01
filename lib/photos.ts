import { supabase } from "./supabase";

/**
 * Nahrání fotky do Supabase Storage
 * @param recordId - ID záznamu
 * @param file - Soubor fotky
 * @returns URL nahraného souboru
 */
export async function uploadPhoto(recordId: string, file: File): Promise<string> {
  try {
    // Získej aktuálního uživatele
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Uživatel není přihlášen');
    }

    // Vygeneruj unikátní název souboru
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `photo_${timestamp}.${fileExt}`;
    
    // Cesta v bucketu: user_id/record_id/filename
    const filePath = `${user.id}/${recordId}/${fileName}`;

    // Nahraj do Supabase Storage
    const { data, error } = await supabase.storage
      .from('dental-photos')
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    // Získej veřejnou URL
    const { data: urlData } = supabase.storage
      .from('dental-photos')
      .getPublicUrl(filePath);

    console.log('✅ Fotka nahrána:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('❌ Chyba při nahrávání fotky:', error);
    throw error;
  }
}

/**
 * Smazání fotky ze Supabase Storage
 * @param photoUrl - URL fotky k smazání
 */
export async function deletePhoto(photoUrl: string): Promise<void> {
  try {
    // Extrahuj cestu ze URL
    // URL formát: https://xxx.supabase.co/storage/v1/object/public/dental-photos/user_id/record_id/filename
    const urlParts = photoUrl.split('/dental-photos/');
    if (urlParts.length !== 2) {
      throw new Error('Neplatná URL fotky');
    }
    const filePath = urlParts[1];

    // Smaž ze Storage
    const { error } = await supabase.storage
      .from('dental-photos')
      .remove([filePath]);

    if (error) throw error;

    console.log('✅ Fotka smazána:', filePath);
  } catch (error) {
    console.error('❌ Chyba při mazání fotky:', error);
    throw error;
  }
}

/**
 * Smazání všech fotek záznamu
 * @param photoUrls - Pole URL fotek k smazání
 */
export async function deleteRecordPhotos(photoUrls: string[]): Promise<void> {
  if (!photoUrls || photoUrls.length === 0) {
    return;
  }

  try {
    // Smaž každou fotku
    for (const url of photoUrls) {
      try {
        await deletePhoto(url);
      } catch (error) {
        console.warn('⚠️ Nepodařilo se smazat fotku:', url, error);
      }
    }

    console.log('✅ Všechny fotky záznamu smazány');
  } catch (error) {
    console.error('❌ Chyba při mazání fotek:', error);
    throw error;
  }
}

