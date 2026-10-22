// Browser speech recognition wrapper with robust error fallback and permission handling

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private preferredVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    this.initRecognition();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
    }
  }

  public initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = 'en-IN'; // Indian English
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
        this.recognition = null;
      }
    }
  }

  private initVoices() {
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      this.preferredVoice =
        voices.find((v) => v.lang === 'en-IN' || v.name.includes('India')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0] ||
        null;
    };

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }
    pickVoice();
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public startListening(
    onInterim: (text: string) => void,
    onResult: (transcript: string) => void,
    onError: (errorMsg: string, isPermissionIssue: boolean) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onError('Speech Recognition is not available in this browser environment.', false);
      return false;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (interim) {
        onInterim(interim);
      }

      if (final) {
        this.isListening = false;
        onResult(final.trim());
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const err = event.error || 'speech_error';
      const isPerm = err === 'not-allowed' || err === 'service-not-allowed';
      let friendlyMsg = 'Microphone standby.';

      if (err === 'not-allowed') {
        friendlyMsg = 'Preview frame restricts direct mic. Tap a voice command below or open in a full tab.';
      } else if (err === 'no-speech') {
        friendlyMsg = 'No speech heard. Speak clearly or tap a voice prompt below.';
      } else if (err === 'network') {
        friendlyMsg = 'Network connectivity issue.';
      } else {
        friendlyMsg = `Microphone: ${err}`;
      }

      onError(friendlyMsg, isPerm);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      this.isListening = false;
      const isPerm = err.name === 'NotAllowedError' || err.message?.includes('not allowed');
      onError(
        err.message || 'Microphone could not be started in this browser frame. Use quick voice commands below.',
        isPerm
      );
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechService();
