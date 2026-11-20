import { useEffect, useRef, useState } from "react";
import { Camera, Circle, Square, Trash2, Upload, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaInfo } from "@/lib/types";
import { rememberMedia, mediaUrl } from "@/lib/media-session";

const MAX_MB = 50;
const MAX_SECONDS = 60;
const RECORD_SECONDS = 30;

/** Upload or record a short video/photo, with preview, validation and remove. No audio is recorded. */
export function MediaCapture({ value, onChange }: { value: MediaInfo | undefined; onChange: (m: MediaInfo | undefined) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRef = useRef<HTMLVideoElement>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [canRecord, setCanRecord] = useState(false);

  useEffect(() => {
    setCanRecord(typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => {
      if (s + 1 >= RECORD_SECONDS) stopRecording();
      return s + 1;
    }), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  const accept = async (file: Blob, name: string) => {
    setError(null);
    if (!file.type.startsWith("video/") && !file.type.startsWith("image/")) { setError("Please choose a video or a photo."); return; }
    if (file.size > MAX_MB * 1024 * 1024) { setError(`That file is over ${MAX_MB} MB. Please pick a shorter clip.`); return; }
    const key = rememberMedia(file);
    let durationSec: number | undefined;
    if (file.type.startsWith("video/")) {
      durationSec = await new Promise<number | undefined>((resolve) => {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.onloadedmetadata = () => resolve(Number.isFinite(v.duration) ? Math.round(v.duration) : undefined);
        v.onerror = () => resolve(undefined);
        v.src = mediaUrl(key) ?? "";
      });
      if (durationSec && durationSec > MAX_SECONDS) { setError(`That video is ${durationSec} seconds. Please keep it under ${MAX_SECONDS} seconds.`); return; }
    }
    onChange({ name, type: file.type, sizeKB: Math.round(file.size / 1024), durationSec, sessionKey: key });
  };

  const startRecording = async () => {
    setError(null);
    try {
      // Video only — Clear Lane never needs sound.
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (liveRef.current) { liveRef.current.srcObject = stream; void liveRef.current.play(); }
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || "video/webm" });
        void accept(blob, `recording-${new Date().toISOString().slice(11, 19).replace(/:/g, "")}.webm`);
      };
      recRef.current = rec;
      rec.start();
      setSeconds(0);
      setRecording(true);
    } catch {
      setError("We couldn't open the camera. You can upload a file instead.");
    }
  };

  function stopRecording() {
    recRef.current?.state === "recording" && recRef.current.stop();
    setRecording(false);
  }

  const src = value?.url ?? mediaUrl(value?.sessionKey);

  return (
    <div className="space-y-3">
      {value ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {src ? (
            value.type.startsWith("video/") ? (
              <video src={src} controls muted playsInline className="aspect-video w-full bg-navy" aria-label="Your video preview" />
            ) : (
              <img src={src} alt="Your photo preview" className="aspect-video w-full object-cover" />
            )
          ) : (
            <div className="grid aspect-video place-items-center bg-muted text-muted-foreground">Preview not available</div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
            <p className="text-sm"><strong>{value.name}</strong> · {value.sizeKB} KB{value.durationSec ? ` · ${value.durationSec}s` : ""}</p>
            <Button variant="outline" size="sm" onClick={() => onChange(undefined)}><Trash2 aria-hidden /> Remove</Button>
          </div>
        </div>
      ) : recording ? (
        <div className="overflow-hidden rounded-2xl border-2 border-destructive bg-navy">
          <video ref={liveRef} muted playsInline className="aspect-video w-full" aria-label="Camera preview while recording" />
          <div className="flex items-center justify-between gap-2 bg-card p-3">
            <p className="flex items-center gap-2 font-semibold" role="status"><Circle className="h-4 w-4 fill-destructive text-destructive" aria-hidden /> Recording · {seconds}s of {RECORD_SECONDS}s</p>
            <Button variant="destructive" onClick={stopRecording}><Square aria-hidden /> Stop</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" size="lg" className="h-auto min-h-20 flex-col py-4" onClick={() => inputRef.current?.click()}>
            <Upload aria-hidden /> Upload a video or photo
            <span className="text-sm font-normal text-muted-foreground">Up to {MAX_MB} MB, {MAX_SECONDS}s</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto min-h-20 flex-col py-4" onClick={startRecording} disabled={!canRecord}>
            {canRecord ? <Video aria-hidden /> : <Camera aria-hidden />} Record a short clip
            <span className="text-sm font-normal text-muted-foreground">{canRecord ? `Video only, up to ${RECORD_SECONDS}s` : "Not supported in this browser"}</span>
          </Button>
          <input ref={inputRef} type="file" accept="video/*,image/*" className="sr-only" tabIndex={-1} aria-hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void accept(f, f.name); e.target.value = ""; }} />
        </div>
      )}
      {error && <p role="alert" className="rounded-xl bg-danger-soft p-3 font-semibold">{error}</p>}
      <p className="text-sm text-muted-foreground">A human service advisor reviews your video. It is not analysed by a machine.</p>
    </div>
  );
}
