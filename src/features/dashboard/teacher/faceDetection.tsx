import React, { useRef, useState, useCallback } from "react";
import * as faceapi from "face-api.js";
// import { supabase } from "@/firebase/supabase.utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import GlobalLoader from "@/components/ui/global-loader";
import { BUCKET_URL } from "@/constants/constants";
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


  const loadLabeledImages = useCallback(async (): Promise<
    faceapi.LabeledFaceDescriptors[]
  > => {
    try {
      const labeledFaces = studentsList.map((student, i) => {
        return {
          label: student.name,
          url: `${BUCKET_URL}${student.id}/face${i + 1}.jpg`,
          id: student.id,
        };
      });

      // build label -> id map for quick lookup after recognition
      labeledMapRef.current = new Map(labeledFaces.map((f) => [f.label, f.id]));

      const descriptors: faceapi.LabeledFaceDescriptors[] = await Promise.all(
        labeledFaces.map(async (face) => {
          const descriptions: Float32Array[] = [];
          try {
            const img = await faceapi.fetchImage(face.url);
            const detection = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();
            if (detection) descriptions.push(detection.descriptor);
          } catch (e) {
            console.warn("Error processing image", face.label, e);
          }

          return new faceapi.LabeledFaceDescriptors(face.label, descriptions);
        })
      );

      return descriptors;
    } catch (err) {
      console.error("loadLabeledImages error", err);
      return [];
    }
  }, [studentsList]);

  const [globalLoading, setGlobalLoading] = useState(false);

  // we'll lazy-load the models and descriptors only when needed (on first upload)
  const modelsLoadedRef = useRef(false);

  const ensureModelsLoaded = useCallback(async () => {
    if (modelsLoadedRef.current) return;
    try {
      setLoading(true);
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      ]);

      const labeled = await loadLabeledImages();
      labeledDescriptorsRef.current = labeled;
      faceMatcherRef.current = new faceapi.FaceMatcher(labeled || [], 0.6);

      modelsLoadedRef.current = true;
    } catch (err) {
      console.error('Failed to initialize face models or descriptors', err);
      setError(String((err as Error)?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }, [loadLabeledImages]);

  

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

      const img = await faceapi.bufferToImage(file as Blob);
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

      const detectionsRaw = await faceapi.detectAllFaces(imageRef.current as HTMLImageElement).withFaceLandmarks().withFaceDescriptors();
      // detectionsRaw comes from face-api; assert to our simplified type for drawing
      drawDetections(detectionsRaw as unknown as DetectionWithDescriptor[]);
      // drawDetections calls setDetectedNames synchronously, hide overlay after names are set
      setGlobalLoading(false);
    } catch (err) {
      console.error('handleUpload error', err);
      setGlobalLoading(false);
      setError(String((err as Error)?.message ?? String(err)));
    }
  }, [drawDetections, ensureModelsLoaded]);

  return (
    <Card className="p-6 space-y-4">
      <GlobalLoader show={globalLoading} message="Recognizing..." />
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Face Recognition Attendance</h2>
        {loading ? (
          <div className="flex items-center gap-2">
            <Spinner />
            <span className="text-sm text-muted-foreground">Loading models...</span>
          </div>
        ) : null}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-1">
          <Label htmlFor="face-file" className="mb-2">Upload image</Label>
          <Input id="face-file" type="file" accept="image/*" onChange={handleUpload} disabled={loading} />
          <div className="mt-3 flex gap-2">
            <Button onClick={async () => {
              // reload descriptors on demand
              setLoading(true);
              labeledDescriptorsRef.current = await loadLabeledImages();
              faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptorsRef.current || [], 0.6);
              setLoading(false);
            }} disabled={loading}>Refresh Labels</Button>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium">Detected</h4>
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