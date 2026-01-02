import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw, Upload, FileAudio } from "lucide-react";
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
    <div className="space-y-6 p-4 bg-muted rounded-lg">
      <div className="flex flex-col items-center justify-center py-4">
        <div className="relative mb-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            isRecording 
              ? 'bg-red-500 animate-pulse' 
              : audioBlob 
                ? 'bg-primary' 
                : 'bg-muted-foreground'
          }`}>
            {isRecording ? (
              <div className="w-10 h-10 bg-white rounded"></div>
            ) : audioBlob ? (
              <FileAudio className="text-white w-10 h-10" />
            ) : (
              <Mic className="text-white w-10 h-10" />
            )}
          </div>
          
          {isRecording && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold text-lg">
            {isRecording ? "Recording..." : audioBlob ? "Audio Ready" : "Voice Recorder"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isRecording 
              ? `Recording: ${formatTime(recordingTime)}` 
              : audioBlob 
                ? "Ready for transcription" 
                : "Record or upload audio"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {!isRecording ? (
          !audioBlob ? (
            <>
              <Button 
                onClick={handleStartRecording}
                className="w-full py-6 text-lg"
                size="lg"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
              
              <div className="relative">
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 text-lg"
                  size="lg"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Audio File
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="audio/*"
                  onChange={handleFileUpload}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleTranscribe}
                disabled={isProcessing}
                className="w-full py-6 text-lg"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Transcribing...
                  </>
                ) : (
                  "Transcribe to Text"
                )}
              </Button>
              
              <Button 
                onClick={handlePlayPause}
                variant="outline"
                className="w-full py-4"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play Recording
                  </>
                )}
              </Button>
            </div>
          )
        ) : (
          <Button 
            onClick={handleStopRecording}
            variant="destructive"
            className="w-full py-6 text-lg"
            size="lg"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop Recording
          </Button>
        )}
        
        {(audioBlob || isRecording) && (
          <Button 
            onClick={handleReset}
            variant="ghost"
            className="w-full py-4"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
      
      {audioBlob && (
        <div className="text-center text-sm text-muted-foreground p-3 bg-background rounded-md">
          <p>Your audio is ready for transcription. Click "Transcribe to Text" to convert speech to text.</p>
        </div>
      )}
    </div>
  );
}