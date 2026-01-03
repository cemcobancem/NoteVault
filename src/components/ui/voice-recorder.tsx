"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw, FileAudio } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { TranscriptionService } from "@/lib/transcription";
import { useToast } from "@/hooks/use-toast";
import { AudioRecording } from "@/types";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  onRecordingComplete?: (recording: AudioRecording) => void;
}

export function VoiceRecorder({ 
  onTranscriptionComplete,
  onRecordingComplete
}: VoiceRecorderProps) {
  const {
    isRecording,
    isPlaying,
    audioUrl,
    recordingTime,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
    resetRecording,
  } = useVoiceRecorder();
  
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioBlobRef = useRef<Blob | null>(null);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record audio.",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = async () => {
    stopRecording();
    
    // Get the audio blob from the media recorder
    if (audioUrl) {
      try {
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();
        audioBlobRef.current = audioBlob;
        
        // If a callback is provided, send the recording
        if (onRecordingComplete) {
          const recording: AudioRecording = {
            id: crypto.randomUUID(),
            blob: audioBlob,
            createdAt: new Date(),
            duration: recordingTime
          };
          onRecordingComplete(recording);
        }
      } catch (error) {
        console.error("Failed to process audio recording:", error);
      }
    }
  };

  const handleTranscribe = async () => {
    if (!audioUrl || !audioBlobRef.current) return;
    
    setIsTranscribing(true);
    try {
      // Transcribe the audio
      const result = await TranscriptionService.transcribe(audioBlobRef.current);
      
      // Pass the transcribed text to the parent component
      onTranscriptionComplete(result.text);
      
      toast({
        title: "Transcription Complete",
        description: "Your voice recording has been transcribed successfully.",
      });
    } catch (error) {
      console.error("Transcription failed:", error);
      toast({
        title: "Transcription Failed",
        description: "Failed to transcribe your recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className={`absolute inset-0 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-muted'}`}></div>
          <div className="relative bg-background rounded-full w-28 h-28 flex items-center justify-center">
            <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-muted-foreground'}`} />
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <div className="text-2xl font-mono font-bold">
            {formatTime(recordingTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {isRecording ? "Recording..." : audioUrl ? "Recording saved" : "Ready to record"}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {!isRecording && !audioUrl && (
          <Button size="lg" onClick={handleStartRecording}>
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </Button>
        )}
        
        {isRecording && (
          <Button size="lg" variant="destructive" onClick={handleStopRecording}>
            <Square className="mr-2 h-4 w-4" />
            Stop Recording
          </Button>
        )}
        
        {!isRecording && audioUrl && (
          <>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={isPlaying ? pauseRecording : playRecording}
              disabled={isTranscribing}
            >
              {isPlaying ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </>
              )}
            </Button>
            
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={resetRecording}
              disabled={isTranscribing}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </>
        )}
      </div>

      {!isRecording && audioUrl && (
        <div className="flex flex-col gap-3">
          <Button 
            size="lg" 
            onClick={handleTranscribe}
            disabled={isTranscribing}
            className="w-full"
          >
            {isTranscribing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Transcribing...
              </>
            ) : (
              "Convert to Text"
            )}
          </Button>
          
          {onRecordingComplete && (
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                if (audioBlobRef.current) {
                  const recording: AudioRecording = {
                    id: crypto.randomUUID(),
                    blob: audioBlobRef.current,
                    createdAt: new Date(),
                    duration: recordingTime
                  };
                  onRecordingComplete(recording);
                }
                resetRecording();
              }}
              className="w-full"
            >
              <FileAudio className="mr-2 h-4 w-4" />
              Attach Recording to Note
            </Button>
          )}
        </div>
      )}

      {audioUrl && (
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
            }
          }}
          className="hidden"
        />
      )}
    </div>
  );
}