import * as faceapi from 'face-api.js';

export async function loadModels(modelPath = '/models') {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
  ]);
}

export type LabeledDescriptorMap = {
  descriptors: faceapi.LabeledFaceDescriptors[];
  labelMap: Map<string, string>; // name -> student id
  loadedCount: number;
  skippedNoPhoto: number;
  skippedNoFaceDetected: number;
};

// Fetches the image as a blob and creates a same-origin object URL to avoid canvas CORS taint
async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching image`);
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(objectUrl); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Image element failed to load')); };
    img.src = objectUrl;
  });
}

export async function loadLabeledDescriptors(
  students: { id: string; name: string; profilePictureUrl?: string; faceImages?: string[] }[],
): Promise<LabeledDescriptorMap> {
  const studentsWithPhotos = students.filter(s => s.profilePictureUrl || (s.faceImages && s.faceImages.length > 0));
  const skippedNoPhoto = students.length - studentsWithPhotos.length;
  let skippedNoFaceDetected = 0;

  const labelMap = new Map<string, string>(
    studentsWithPhotos.map(s => [s.name, s.id])
  );

  const all = await Promise.all(
    studentsWithPhotos.map(async (student) => {
      const descriptions: Float32Array[] = [];
      // Collect all available image URLs for this student
      const imageUrls = [
        student.profilePictureUrl,
        ...(student.faceImages ?? []),
      ].filter((u): u is string => Boolean(u));

      for (const url of imageUrls) {
        try {
          const img = await loadImageFromUrl(url);
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detection) {
            descriptions.push(detection.descriptor);
          } else {
            console.warn('face-api: no face detected in photo for', student.name, url);
          }
        } catch (err) {
          console.warn('face-api: could not process photo for', student.name, err);
        }
      }

      if (descriptions.length === 0) skippedNoFaceDetected++;
      return new faceapi.LabeledFaceDescriptors(student.name, descriptions);
    }),
  );

  const descriptors = all.filter(d => d.descriptors.length > 0);
  return { descriptors, labelMap, loadedCount: descriptors.length, skippedNoPhoto, skippedNoFaceDetected };
}

export function createFaceMatcher(
  labeledDescriptors: faceapi.LabeledFaceDescriptors[],
  distance = 0.55,
): faceapi.FaceMatcher | null {
  if (labeledDescriptors.length === 0) return null;
  return new faceapi.FaceMatcher(labeledDescriptors, distance);
}

export async function detectAllFacesFromImage(imgEl: HTMLImageElement) {
  return faceapi.detectAllFaces(imgEl).withFaceLandmarks().withFaceDescriptors();
}

export const bufferToImage = faceapi.bufferToImage;

export default {
  loadModels,
  loadLabeledDescriptors,
  createFaceMatcher,
  detectAllFacesFromImage,
  bufferToImage,
};
