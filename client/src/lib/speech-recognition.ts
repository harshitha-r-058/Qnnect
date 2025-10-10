export interface TranscriptEntry {
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export class SpeechRecognition {
  private recognition: any = null;
  private isRunning = false;
  private startTime = 0;
  private onTranscriptCallback: ((entry: TranscriptEntry) => void) | null = null;

  initialize(onTranscript: (entry: TranscriptEntry) => void): boolean {
    // Check if Web Speech API is available
    const SpeechRecognitionAPI = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn('Web Speech API not supported in this browser');
      return false;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.onTranscriptCallback = onTranscript;

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const timestamp = (Date.now() - this.startTime) / 1000;

        if (this.onTranscriptCallback) {
          this.onTranscriptCallback({
            text: transcript,
            timestamp,
            isFinal: result.isFinal,
          });
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart recognition if no speech detected
        if (this.isRunning) {
          this.recognition.start();
        }
      }
    };

    this.recognition.onend = () => {
      // Automatically restart if still supposed to be running
      if (this.isRunning) {
        this.recognition.start();
      }
    };

    return true;
  }

  start(): void {
    if (!this.recognition) {
      console.warn('Speech recognition not initialized');
      return;
    }

    this.startTime = Date.now();
    this.isRunning = true;
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  cleanup(): void {
    this.stop();
    this.recognition = null;
    this.onTranscriptCallback = null;
  }
}
