import React, { useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
// import { supabase } from "@/firebase/supabase.utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
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


const FaceRecognition: React.FC<{ studentsList: { id: string; name: string }[]; onRecognize?: (ids: string[]) => void }> = ({ studentsList, onRecognize }) => {
  // don't show loading on mount; models load lazily on upload
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedNames, setDetectedNames] = useState<string[]>([]);
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
    setDetectedNames(names);
    console.log("🚀 ~ FaceRecognition ~ names:", names, "ids:", uniqueIds);
    if (onRecognize && uniqueIds.length) onRecognize(uniqueIds);
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


  return (
    <Card className="p-2 sm:p-4 md:p-6 space-y-2 sm:space-y-4">
      <GlobalLoader show={globalLoading} message="Recognizing..." />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold">Face Recognition Attendance</h2>
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span className="text-xs sm:text-sm text-muted-foreground">Loading models...</span>
          </div>
        ) : null}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 items-start">
        <div className="md:col-span-1">
          <Label htmlFor="face-file" className="mb-2 text-xs sm:text-sm">Upload image</Label>
          <Input id="face-file" type="file" accept="image/*" onChange={handleUpload} disabled={loading} className="cursor-pointer text-xs sm:text-sm" />
          <div className="mt-3 sm:mt-4">
            <h4 className="text-xs sm:text-sm font-medium">Detected</h4>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {detectedNames.length === 0 && <li className="text-sm text-muted-foreground">No detections yet</li>}
              {detectedNames.map((name, i) => (
                <li key={i} className="text-sm">{name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="relative bg-muted rounded-md overflow-hidden" style={{ paddingTop: '56.25%' }}>
            {/* container that keeps aspect ratio */}
              {/* always render the <img> so ref is attached; show placeholder overlay when no src */}
              <img ref={imageRef} src={imageSrc ?? undefined} onLoad={handleImageLoad} className="absolute inset-0 w-full h-full" />
              {!imageSrc && (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center text-muted-foreground">No image uploaded</div>
              )}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FaceRecognition;