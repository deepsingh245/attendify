import * as faceapi from 'face-api.js';

export async function loadModels(modelPath = '/models') {
  // loads the common nets used in this app
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
  ]);
}

export type LabeledDescriptorMap = {
  descriptors: faceapi.LabeledFaceDescriptors[];
  labelMap: Map<string, string>; // label -> id
};

export async function loadLabeledDescriptors(
  students: { id: string; name: string }[],
  bucketUrl: string,
): Promise<LabeledDescriptorMap> {
  const labeledFaces = students.map((student, i) => ({
    label: student.name,
    url: `${bucketUrl}${student.id}/face${i + 1}.jpg`,
    id: student.id,
  }));

  const labelMap = new Map<string, string>(labeledFaces.map((f) => [f.label, f.id]));

  const descriptors = await Promise.all(
    labeledFaces.map(async (face) => {
      const descriptions: Float32Array[] = [];
      try {
        const img = await faceapi.fetchImage(face.url);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detection) descriptions.push(detection.descriptor);
      } catch (err) {
        // continue on error for this face
        console.warn('face-api: error processing', face.label, err);
      }
      return new faceapi.LabeledFaceDescriptors(face.label, descriptions);
    }),
  );

  return { descriptors, labelMap };
}

export function createFaceMatcher(
  labeledDescriptors: faceapi.LabeledFaceDescriptors[] | undefined,
  distance = 0.6,
) {
  return new faceapi.FaceMatcher(labeledDescriptors || [], distance);
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
