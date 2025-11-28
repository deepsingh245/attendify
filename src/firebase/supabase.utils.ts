/// <reference types="vite/client" />
import { BUCKET_URL } from "@/constants/constants";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://kbxvquzdkuvqshyarpgj.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const uploadStudentImageToSupabase = async (file: File, studentId: string) => {
  try {
    const { data, error } = await supabase.storage
      .from("attendify_assets")
      .upload(`${studentId}/${file.name}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading student image:", error);
      throw new Error(error.message || "Failed to upload student image.");
    }
    data.fullPath = `${BUCKET_URL}${data.path}`
    return data;
  } catch (err) {
    console.error("Unhandled error during student image upload:", err);
    throw err;
  }
};

const uploadImageToSupabase = async (file: File, folder: string) => {
  try {
    const { data, error } = await supabase.storage
      .from("attendify_assets")
      .upload(`${folder}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw new Error(error.message || "Failed to upload image.");
    }
    data.fullPath = `${BUCKET_URL}${data.path}`
    return data;
  } catch (err) {
    console.error("Unhandled error during image upload:", err);
    throw err;
  }
};


export { supabase, uploadImageToSupabase, uploadStudentImageToSupabase };