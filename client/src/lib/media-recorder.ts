export class VideoRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async initialize(stream: MediaStream): Promise<void> {
    this.stream = stream;
    
    // Check for supported mime types
    const mimeTypes = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
    ];

    let selectedMimeType = '';
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        selectedMimeType = type;
        break;
      }
    }

    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMimeType || 'video/webm',
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
  }

  start(): void {
    if (!this.mediaRecorder) {
      throw new Error('MediaRecorder not initialized');
    }

    this.chunks = [];
    this.mediaRecorder.start(1000); // Collect data every second
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.chunks = [];
    this.mediaRecorder = null;
    this.stream = null;
  }
}

export async function captureVideoThumbnail(
  videoElement: HTMLVideoElement
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(null);
      return;
    }

    // Wait for video to have loaded enough to capture a frame
    const captureFrame = () => {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    };

    if (videoElement.readyState >= 2) {
      captureFrame();
    } else {
      videoElement.addEventListener('loadeddata', captureFrame, { once: true });
    }
  });
}
