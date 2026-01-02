import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";
import { TranscriptionService } from "@/lib/transcription";

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
  const {
    isRecording,
    isPlaying,
    audioUrl,
    recordingTime,
    startRecording,
    stopRecording,
    playRecording,
    pauseRecording,
    resetRecording
  } = useVoiceRecorder();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const audioBlobRef = useRef<Blob | null>(null);

  // Update audio blob when audioUrl changes
  useEffect(() => {
    if (audioUrl) {
      fetch(audioUrl)
        .then(response => response.blob())
        .then(blob => {
          setAudioBlob(blob);
          audioBlobRef.current = blob;
        });
    }
  }, [audioUrl]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to record audio",
        variant: "destructive",
      });
    }
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseRecording();
    } else {
      playRecording();
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlobRef.current) return;
    
    setIsProcessing(true);
    
    try {
      const result = await TranscriptionService.transcribe(audioBlobRef.current);
      
      onTranscriptionComplete(result.text);
      toast({
        title: "Transcription Complete",
        description: "Your voice recording has been transcribed",
      });
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Transcription Error",
        description: "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    resetRecording();
    setAudioBlob(null);
    audioBlobRef.current = null;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioBlob(file);
      audioBlobRef.current = file;
      toast({
        title: "File Uploaded",
        description: "Audio file ready for transcription",
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid audio file",
        variant: "destructive",
      });
    }
    // Reset input value to allow uploading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
              <span className="text-sm text-muted-foreground">{formatTime(recordingTime)}</span>
            </div>
          ) : audioBlob ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Audio ready</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Ready to record or upload</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isRecording ? (
          !audioBlob ? (
            <>
              <Button 
                onClick={handleStartRecording}
                className="flex-1"
              >
                <Mic className="h-4 w-4 mr-2" />
                Record
              </Button>
              <Button 
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="audio/*"
                onChange={handleFileUpload}
              />
            </>
          ) : (
            <>
              <Button 
                onClick={handleTranscribe}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  "Transcribing..."
                ) : (
                  "Transcribe"
                )}
              </Button>
            </>
          )
        ) : (
          <Button 
            onClick={handleStopRecording}
            variant="destructive"
            className="flex-1"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        )}
        
        {audioBlob && (
          <Button 
            onClick={handleReset}
            variant="outline"
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {audioBlob && (
        <div className="text-xs text-muted-foreground mt-2">
          Audio file ready for transcription. Click "Transcribe" to convert speech to text.
        </div>
      )}
    </div>
  );
}