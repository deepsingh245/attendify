import React, { useRef, useState, useCallback, useImperativeHandle } from "react";
import * as faceapi from "face-api.js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import GlobalLoader from "@/components/ui/global-loader";
import {
  loadModels,
  loadLabeledDescriptors,
  createFaceMatcher,
  detectAllFacesFromImage,
  bufferToImage,
} from "@/services/face-api.service";

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [, setDetectedNames] = useState<string[]>([]);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const labeledMapRef = useRef<Map<string, string> | null>(null);

  const [globalLoading, setGlobalLoading] = useState(false);
  const modelsLoadedRef = useRef(false);

  const loadDescriptors = useCallback(async () => {
    const { descriptors, labelMap, loadedCount, skippedNoPhoto, skippedNoFaceDetected } =
      await loadLabeledDescriptors(studentsList);

    labeledMapRef.current = labelMap;
    faceMatcherRef.current = createFaceMatcher(descriptors, 0.55);

    const total = studentsList.length;
    if (loadedCount === 0) {
      const reasons: string[] = [];
      if (skippedNoPhoto > 0) reasons.push(`${skippedNoPhoto} have no profile photo`);
      if (skippedNoFaceDetected > 0) reasons.push(`${skippedNoFaceDetected} photo had no detectable face`);
      setStatusMsg(`No students loaded for recognition. ${reasons.join(', ')}.`);
    } else {
      const parts: string[] = [];
      if (skippedNoPhoto > 0) parts.push(`${skippedNoPhoto} no photo`);
      if (skippedNoFaceDetected > 0) parts.push(`${skippedNoFaceDetected} face not detected`);
      const suffix = parts.length > 0 ? ` (${parts.join(', ')})` : '';
      setStatusMsg(`Loaded ${loadedCount} of ${total} students for recognition${suffix}.`);
    }
  }, [studentsList]);

  const ensureModelsLoaded = useCallback(async () => {
    if (modelsLoadedRef.current) return;
    try {
      setLoading(true);
      await loadModels('/models');
      await loadDescriptors();
      modelsLoadedRef.current = true;
    } catch (err) {
      console.error('Failed to initialize face models or descriptors', err);
      setError(String((err as Error)?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }, [loadDescriptors]);

  type Box = { x: number; y: number; width: number; height: number };
  type DetectionWithDescriptor = { detection: { box: Box }; descriptor: Float32Array };

  const drawDetections = useCallback((detections: DetectionWithDescriptor[]) => {
    const imgEl = imageRef.current;
    const canvas = canvasRef.current;
    if (!imgEl || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerW = imgEl.offsetWidth;
    const containerH = imgEl.offsetHeight;
    const naturalW = imgEl.naturalWidth || containerW;
    const naturalH = imgEl.naturalHeight || containerH;

    // object-contain: uniform scale + letterbox offsets
    const scale = Math.min(containerW / naturalW, containerH / naturalH);
    const offsetX = (containerW - naturalW * scale) / 2;
    const offsetY = (containerH - naturalH * scale) / 2;

    canvas.width = containerW;
    canvas.height = containerH;
    ctx.clearRect(0, 0, containerW, containerH);

    const names: string[] = [];
    const ids: string[] = [];

    detections.forEach((d) => {
      const box = d.detection.box;
      const bx = box.x * scale + offsetX;
      const by = box.y * scale + offsetY;
      const bw = box.width * scale;
      const bh = box.height * scale;

      let color = '#dc2626';       // red — unknown
      let displayLabel = 'Unknown';

      if (faceMatcherRef.current) {
        const match = faceMatcherRef.current.findBestMatch(d.descriptor);
        const { label, distance } = match as { label: string; distance: number };

        if (label !== 'unknown') {
          const confidence = Math.round((1 - distance) * 100);
          displayLabel = `${label}  ${confidence}%`;
          color = distance < 0.4 ? '#16a34a' : '#d97706'; // green or amber
          names.push(label);
          const id = labeledMapRef.current?.get(label);
          if (id) ids.push(id);
        } else {
          names.push('unknown');
        }
      }

      // Draw box
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      // Label background
      ctx.font = 'bold 12px sans-serif';
      const textW = ctx.measureText(displayLabel).width;
      const labelY = Math.max(16, by - 4);
      ctx.fillStyle = color;
      ctx.fillRect(bx - 1, labelY - 14, textW + 8, 17);

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(displayLabel, bx + 3, labelY);
    });

    const uniqueIds = Array.from(new Set(ids));
    setDetectedNames(names);
    if (onRecognize) onRecognize(uniqueIds, uniqueIds.length, detections.length - uniqueIds.length);
  }, [onRecognize]);

  const handleImageLoad = useCallback(() => {
    const imgEl = imageRef.current;
    const canvas = canvasRef.current;
    if (!imgEl || !canvas) return;
    canvas.width = imgEl.offsetWidth;
    canvas.height = imgEl.offsetHeight;
  }, []);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setDetectedNames([]);
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setGlobalLoading(true);
      await ensureModelsLoaded();

      // Refresh descriptors on every upload (student list may have changed)
      setLoading(true);
      await loadDescriptors();
      setLoading(false);

      const img = await bufferToImage(file as Blob);
      setImageSrc(img.src);

      await new Promise<void>((resolve) => {
        const start = Date.now();
        const tryAttach = () => {
          const el = imageRef.current;
          if (!el) {
            if (Date.now() - start > 5000) return resolve();
            return setTimeout(tryAttach, 50);
          }
          if (el.complete && el.naturalWidth !== 0) return resolve();
          const onLoad = () => { el.removeEventListener('load', onLoad); resolve(); };
          el.addEventListener('load', onLoad);
          setTimeout(() => { el.removeEventListener('load', onLoad); resolve(); }, 5000);
        };
        tryAttach();
      });

      const detectionsRaw = await detectAllFacesFromImage(imageRef.current as HTMLImageElement);
      drawDetections(detectionsRaw as unknown as DetectionWithDescriptor[]);
      setGlobalLoading(false);
    } catch (err) {
      console.error('handleUpload error', err);
      setGlobalLoading(false);
      setError(String((err as Error)?.message ?? String(err)));
    }
  }, [drawDetections, ensureModelsLoaded, loadDescriptors]);

  const handleDrag = useCallback(function (e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback(function (e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleUpload({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [handleUpload]);

  const [dragActive, setDragActive] = useState(false);

  return (
    <div className="flex flex-col w-full gap-2">
      <GlobalLoader show={globalLoading} message="Recognizing..." />

      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {statusMsg && !error && (
        <div className="w-full text-xs px-3 py-1.5 rounded-md bg-muted/50 text-muted-foreground border border-border">
          {statusMsg}
        </div>
      )}

      {/* Dropzone — hidden once image is loaded */}
      {!imageSrc && (
        <Label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors ${
            dragActive ? "border-blue-500" : "border-border"
          }`}
          style={{ minHeight: '300px' }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center py-10">
            <svg className="w-10 h-10 mb-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L7 9m3-3 3 3"/>
            </svg>
            <p className="mb-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">PNG, JPG (MAX. 10MB)</p>
          </div>
          <Input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={loading} />
        </Label>
      )}

      {/* Image preview — full size when loaded */}
      {imageSrc && (
        <div className="relative w-full rounded-lg overflow-hidden border border-border bg-black/20" style={{ minHeight: '420px' }}>
          <img
            ref={imageRef}
            src={imageSrc}
            onLoad={handleImageLoad}
            className="w-full h-full object-contain"
            style={{ minHeight: '420px', maxHeight: '560px' }}
            alt="Classroom photo"
          />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Re-upload button overlay */}
          <label
            htmlFor="dropzone-file-replace"
            className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs cursor-pointer transition-colors"
          >
            <svg className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L7 9m3-3 3 3"/>
            </svg>
            Change photo
            <input id="dropzone-file-replace" type="file" className="hidden" accept="image/*" onChange={handleUpload} />
          </label>
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
  studentsList: { id: string; name: string; profilePictureUrl?: string }[];
  onRecognize: (ids: string[], detectedCount: number, undetectedCount: number) => void;
}
