// face-api.js emotion detection
// Models are loaded from CDN

export interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: number;
}

let faceApiLoaded = false;
let faceapi: any = null;

export async function loadFaceApiModels(): Promise<boolean> {
  if (faceApiLoaded) return true;

  try {
    // Dynamically import face-api.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/dist/face-api.min.js';
    script.async = true;
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    // Access the global faceapi object
    faceapi = (window as any).faceapi;

    if (!faceapi) {
      throw new Error('face-api.js not loaded');
    }

    // Load models from CDN
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);

    faceApiLoaded = true;
    return true;
  } catch (error) {
    console.error('Error loading face-api.js:', error);
    return false;
  }
}

export class EmotionDetector {
  private isRunning = false;
  private videoElement: HTMLVideoElement | null = null;
  private detectionInterval: NodeJS.Timeout | null = null;
  private startTime = 0;
  private onEmotionCallback: ((data: EmotionData) => void) | null = null;

  async initialize(
    videoElement: HTMLVideoElement,
    onEmotion: (data: EmotionData) => void
  ): Promise<boolean> {
    const loaded = await loadFaceApiModels();
    if (!loaded) {
      console.warn('Face API models not available');
      return false;
    }

    this.videoElement = videoElement;
    this.onEmotionCallback = onEmotion;
    return true;
  }

  start(): void {
    if (!this.videoElement || !faceapi || !this.onEmotionCallback) {
      console.warn('Emotion detection not properly initialized');
      return;
    }

    this.startTime = Date.now();
    this.isRunning = true;

    // Detect emotions every 2 seconds
    this.detectionInterval = setInterval(async () => {
      if (!this.videoElement || !this.isRunning) return;

      try {
        const detections = await faceapi
          .detectSingleFace(this.videoElement, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections && detections.expressions) {
          const expressions = detections.expressions;
          
          // Find dominant emotion
          const emotionEntries = Object.entries(expressions) as [string, number][];
          const [dominantEmotion, confidence] = emotionEntries.reduce((max, curr) =>
            curr[1] > max[1] ? curr : max
          );

          const timestamp = (Date.now() - this.startTime) / 1000;

          if (this.onEmotionCallback) {
            this.onEmotionCallback({
              emotion: dominantEmotion,
              confidence,
              timestamp,
            });
          }
        }
      } catch (error) {
        console.error('Error detecting emotions:', error);
      }
    }, 2000);
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }

  cleanup(): void {
    this.stop();
    this.videoElement = null;
    this.onEmotionCallback = null;
  }
}
