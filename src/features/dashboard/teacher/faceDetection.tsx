import React, { useRef, useState, useCallback, useImperativeHandle } from "react";
import * as faceapi from "face-api.js";
// import { supabase } from "@/firebase/supabase.utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import GlobalLoader from "@/components/ui/global-loader";
import { BUCKET_URL } from "@/constants/constants";
import {
  loadModels,
  loadLabeledDescriptors,
  createFaceMatcher,
  detectAllFacesFromImage,
  bufferToImage,
} from "@/services/face-api.service";
// import { supabase } from "@/firebase/supabase.utils";


const FaceRecognition = React.forwardRef<FaceRecognitionRef, FaceRecognitionProps>(({ studentsList, onRecognize }, ref) => {
  useImperativeHandle(ref, () => ({
    detectFaces: async () => {
      if (!imageRef.current) {
        setError("No image uploaded to detect faces.");
        return;
      }
      setGlobalLoading(true);
      try {
        await ensureModelsLoaded();
        const detectionsRaw = await detectAllFacesFromImage(imageRef.current as HTMLImageElement);
        drawDetections(detectionsRaw as unknown as DetectionWithDescriptor[]);
      } catch (err) {
        console.error('Failed to detect faces', err);
        setError(String((err as Error)?.message ?? String(err)));
      } finally {
        setGlobalLoading(false);
      }
    },
  }));
  // don't show loading on mount; models load lazily on upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setDetectedNames] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // cache labeled descriptors and matcher in refs to avoid re-fetching on each upload
  const labeledDescriptorsRef = useRef<faceapi.LabeledFaceDescriptors[] | null>(null);
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const labeledMapRef = useRef<Map<string, string> | null>(null);


  // loadLabeledDescriptors handled in service

  const [globalLoading, setGlobalLoading] = useState(false);

  // we'll lazy-load the models and descriptors only when needed (on first upload)
  const modelsLoadedRef = useRef(false);

  const ensureModelsLoaded = useCallback(async () => {
    if (modelsLoadedRef.current) return;
    try {
      setLoading(true);
      // use service to load models and labeled descriptors
      await loadModels('/models');
      const { descriptors, labelMap } = await loadLabeledDescriptors(studentsList, BUCKET_URL);
      labeledDescriptorsRef.current = descriptors;
      labeledMapRef.current = labelMap;
      faceMatcherRef.current = createFaceMatcher(descriptors, 0.6);

      modelsLoadedRef.current = true;
    } catch (err) {
      console.error('Failed to initialize face models or descriptors', err);
      setError(String((err as Error)?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }, [studentsList]);

  

  type Box = { x: number; y: number; width: number; height: number };
  type DetectionWithDescriptor = { detection: { box: Box }; descriptor: Float32Array };

  const drawDetections = useCallback((detections: DetectionWithDescriptor[]) => {
    const imgEl = imageRef.current;
    const canvas = canvasRef.current;
    if (!imgEl || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // match canvas size to displayed image
    canvas.width = imgEl.width;
    canvas.height = imgEl.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = imgEl.width / (imgEl.naturalWidth || imgEl.width);
    const scaleY = imgEl.height / (imgEl.naturalHeight || imgEl.height);

    const names: string[] = [];
    const ids: string[] = [];

    detections.forEach((d) => {
      const best = faceMatcherRef.current?.findBestMatch(d.descriptor) ?? { label: 'unknown' };
      const box = d.detection.box;

      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x * scaleX, box.y * scaleY, box.width * scaleX, box.height * scaleY);

      ctx.fillStyle = '#111827';
      ctx.font = '14px sans-serif';
      const text = best.toString();
      ctx.fillText(text, box.x * scaleX + 4, Math.max(12, box.y * scaleY - 6));

      names.push(best.label);
      const id = labeledMapRef.current?.get(best.label);
      if (id) ids.push(id);
    });
    // unique ids
    const uniqueIds = Array.from(new Set(ids));
    const detectedCount = uniqueIds.length;
    const undetectedCount = detections.length - detectedCount; // Total detections minus recognized faces

    setDetectedNames(names);
    console.log("🚀 ~ FaceRecognition ~ names:", names, "ids:", uniqueIds, "detected:", detectedCount, "undetected:", undetectedCount);
    if (onRecognize) onRecognize(uniqueIds, detectedCount, undetectedCount);
  }, [onRecognize]);

  // ensure canvas matches rendered image size when image loads
  const handleImageLoad = useCallback(() => {
    const imgEl = imageRef.current;
    const canvas = canvasRef.current;
    if (!imgEl || !canvas) return;
    // size canvas to displayed image dimensions
    canvas.width = imgEl.width;
    canvas.height = imgEl.height;
    // if there are already detections, redraw them by reading current image and re-running detection
    // (we don't store last detections here; drawDetections will be called after detect)
  }, []);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setDetectedNames([]);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // show global overlay while recognition is in progress
      setGlobalLoading(true);
      // Lazy-load models & descriptors on first upload
      await ensureModelsLoaded();

      // Refresh labels on every upload
      setLoading(true);
      const { descriptors, labelMap } = await loadLabeledDescriptors(studentsList, BUCKET_URL);
      labeledDescriptorsRef.current = descriptors;
      labeledMapRef.current = labelMap;
      faceMatcherRef.current = createFaceMatcher(descriptors, 0.6);
      setLoading(false);

      const img = await bufferToImage(file as Blob);
      // set image src via state so the <img> is rendered with src and the ref is attached
      setImageSrc(img.src);

      // wait for image element to mount and load
      await new Promise<void>((resolve) => {
        const start = Date.now();

        const tryAttach = () => {
          const el = imageRef.current;
          if (!el) {
            // not mounted yet, try again shortly
            if (Date.now() - start > 5000) return resolve();
            return setTimeout(tryAttach, 50);
          }

          if (el.complete && el.naturalWidth !== 0) return resolve();

          const onLoad = () => {
            el.removeEventListener('load', onLoad);
            resolve();
          };

          el.addEventListener('load', onLoad);

          // fallback: timeout
          setTimeout(() => {
            el.removeEventListener('load', onLoad);
            resolve();
          }, 5000);
        };

        tryAttach();
      });

  const detectionsRaw = await detectAllFacesFromImage(imageRef.current as HTMLImageElement);
      // detectionsRaw comes from face-api; assert to our simplified type for drawing
      drawDetections(detectionsRaw as unknown as DetectionWithDescriptor[]);
      // drawDetections calls setDetectedNames synchronously, hide overlay after names are set
      setGlobalLoading(false);
    } catch (err) {
      console.error('handleUpload error', err);
      setGlobalLoading(false);
      setError(String((err as Error)?.message ?? String(err)));
    }
  }, [drawDetections, ensureModelsLoaded, studentsList]);


  const handleDrag = useCallback(function (e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(function (e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleUpload]);

  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <GlobalLoader show={globalLoading} message="Recognizing..." />
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Label
        htmlFor="dropzone-file"
        className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 ${
          dragActive ? "border-blue-600" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L7 9m3-3 3 3"/>
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 10MB)</p>
        </div>
        <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={loading} />
      </Label>
      {imageSrc && (
        <div className="mt-4 relative w-full h-[200px] border border-gray-300 rounded-lg flex items-center justify-center">
          <img ref={imageRef} src={imageSrc} onLoad={handleImageLoad} className="absolute inset-0 w-full h-full object-contain" alt="Preview" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        </div>
      )}
    </div>
  );
});

export default FaceRecognition;

export interface FaceRecognitionRef {
  detectFaces: () => Promise<void>;
}

export interface FaceRecognitionProps {
  studentsList: { id: string; name: string }[];
  onRecognize: (ids: string[], detectedCount: number, undetectedCount: number) => void;
}