import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";

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
  const { toast } = useToast();

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
    if (!audioUrl) return;
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, you would send the audio to a transcription service
      // For this demo, we'll simulate transcription with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated transcription result
      const simulatedTranscription = "This is a simulated transcription of your voice recording. In a real implementation, this would be the actual transcribed text from your audio.";
      
      onTranscriptionComplete(simulatedTranscription);
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
          ) : audioUrl ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Recording saved</span>
              <span className="text-sm text-muted-foreground">{formatTime(recordingTime)}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Ready to record</span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {!isRecording ? (
          !audioUrl ? (
            <Button 
              onClick={handleStartRecording}
              className="flex-1"
            >
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <>
              <Button 
                onClick={handlePlayPause}
                variant="outline"
                className="flex-1"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
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
        
        {audioUrl && (
          <Button 
            onClick={handleReset}
            variant="outline"
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}