import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw, Loader2, Volume2 } from "lucide-react";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { TranscriptionService } from "@/lib/transcription";
import { AudioRecording } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onTranscriptionComplete: (transcribedText: string) => void;
  onRecordingComplete: (recording: AudioRecording) => void;
}

export function VoiceRecorder({ onTranscriptionComplete, onRecordingComplete }: VoiceRecorderProps) {
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
  
  const { toast, dismiss } = useToast(); // Destructure dismiss here
  const [isTranscribing, setIsTranscribing] = useState(false);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    const result = stopRecording();
    if (result) {
      // We need to transcribe the audio blob
      handleTranscribe(result.blob, result.duration);
    }
  };
  
  const handleTranscribe = async (audioBlob: Blob, duration: number) => {
    setIsTranscribing(true);
    const loadingToast = toast({
      title: "Transcribing...",
      description: "Processing audio, please wait.",
      variant: "default",
      duration: 30000, // Long duration for transcription
    });

    try {
      const transcriptionResult = await TranscriptionService.transcribe(audioBlob);
      
      // 1. Handle transcription
      onTranscriptionComplete(transcriptionResult.text);
      
      // 2. Handle saving the audio recording
      const recording: AudioRecording = {
        id: crypto.randomUUID(),
        blob: audioBlob,
        createdAt: new Date(),
        transcription: transcriptionResult.text,
        duration: duration,
      };
      onRecordingComplete(recording);

      dismiss(loadingToast.id); // Use the global dismiss function with the toast ID
      toast({
        title: "Transcription Complete",
        description: "Audio transcribed and attached to the note.",
      });
      
    } catch (error) {
      console.error("Transcription failed:", error);
      dismiss(loadingToast.id); // Use the global dismiss function with the toast ID
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe audio. The recording is still attached.",
        variant: "destructive",
      });
      
      // Still save the recording even if transcription fails
      const recording: AudioRecording = {
        id: crypto.randomUUID(),
        blob: audioBlob,
        createdAt: new Date(),
        duration: duration,
      };
      onRecordingComplete(recording);
      
    } finally {
      setIsTranscribing(false);
      resetRecording();
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
        isRecording ? 'bg-red-500 ring-8 ring-red-500/30 animate-pulse' : 'bg-primary'
      }`}>
        <Mic className="h-10 w-10 text-white" />
      </div>

      <p className={`text-2xl font-mono ${isRecording ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
        {formatTime(recordingTime)}
      </p>

      <div className="flex space-x-4">
        {!isRecording && !audioUrl && (
          <Button 
            onClick={startRecording} 
            disabled={isTranscribing}
            className="w-32"
          >
            <Mic className="mr-2 h-4 w-4" />
            Record
          </Button>
        )}

        {isRecording && (
          <Button 
            onClick={handleStop} 
            variant="destructive" 
            className="w-32"
          >
            <Square className="mr-2 h-4 w-4" />
            Stop
          </Button>
        )}
        
        {audioUrl && !isRecording && (
          <>
            <Button 
              onClick={isPlaying ? pauseRecording : playRecording} 
              disabled={isTranscribing}
              variant="secondary"
              className="w-32"
            >
              {isPlaying ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button 
              onClick={resetRecording} 
              variant="outline" 
              size="icon"
              disabled={isTranscribing}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      
      {isTranscribing && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Transcribing audio...
        </div>
      )}
    </div>
  );
}