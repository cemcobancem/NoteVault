import { useState, useRef } from "react";

export interface UseVoiceRecorderReturn {
  isRecording: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => { blob: Blob; duration: number } | null;
  playRecording: () => void;
  pauseRecording: () => void;
  resetRecording: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Find the best supported format
      const types = [
        'audio/webm; codecs=opus',
        'audio/webm',
        'audio/ogg; codecs=opus',
        'audio/mp4',
        'audio/aac'
      ];
      
      let mimeType = 'audio/webm';
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      mimeTypeRef.current = mimeType;
      console.log("Using MIME type for recording:", mimeType);

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      throw error;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const finalDuration = recordingTime;
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeTypeRef.current });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      return { blob: audioBlob, duration: finalDuration };
    }
    return null;
  };

  const playRecording = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setIsPlaying(false);
        audioRef.current.onerror = (e) => {
          console.error("Playback error:", e);
          setIsPlaying(false);
        };
      }

      audioRef.current.play().catch(err => {
        console.error("Play failed:", err);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resetRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setIsPlaying(false);
    setRecordingTime(0);
  };

  return {
    isRecording, isPlaying, audioUrl, recordingTime,
    startRecording, stopRecording, playRecording, pauseRecording, resetRecording
  };
}