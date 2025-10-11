/**
 * RFID Reader Utilities
 * Handles different types of RFID readers for 13.56MHz NFC cards
 */

export interface RFIDCard {
  uid: string;
  type: 'mifare' | 'ntag' | 'unknown';
  timestamp: number;
}

export interface RFIDReaderConfig {
  readerType: 'keyboard-wedge' | 'pcsc' | 'auto-detect';
  timeout: number; // in milliseconds
  prefix?: string; // for keyboard wedge readers
  suffix?: string; // for keyboard wedge readers
}

export class RFIDReader {
  private config: RFIDReaderConfig;
  private listening: boolean = false;
  private buffer: string = '';
  private callbacks: ((card: RFIDCard) => void)[] = [];
  private keyListener?: (event: KeyboardEvent) => void;
  private bufferTimeout?: NodeJS.Timeout;

  constructor(config: Partial<RFIDReaderConfig> = {}) {
    this.config = {
      readerType: 'auto-detect',
      timeout: 5000,
      prefix: '',
      suffix: '\r', // Most readers send carriage return
      ...config
    };
  }

  /**
   * Start listening for RFID cards
   */
  async startListening(): Promise<void> {
    if (this.listening) return;

    this.listening = true;
    
    if (this.config.readerType === 'keyboard-wedge' || this.config.readerType === 'auto-detect') {
      this.startKeyboardWedgeListener();
    }

    if (this.config.readerType === 'pcsc' || this.config.readerType === 'auto-detect') {
      // PC/SC requires native libraries, this would be for Electron apps
      // For web apps, we'll focus on keyboard wedge readers
      console.log('PC/SC reader support requires native implementation');
    }
  }

  /**
   * Stop listening for RFID cards
   */
  stopListening(): void {
    this.listening = false;
    this.buffer = '';
    
    if (this.keyListener) {
      window.removeEventListener('keydown', this.keyListener);
      this.keyListener = undefined;
    }

    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = undefined;
    }
  }

  /**
   * Add a callback for when cards are detected
   */
  onCardDetected(callback: (card: RFIDCard) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove a card detection callback
   */
  removeCardDetectedCallback(callback: (card: RFIDCard) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Start keyboard wedge listener
   */
  private startKeyboardWedgeListener(): void {
    this.keyListener = (event: KeyboardEvent) => {
      if (!this.listening) return;

      // Handle special keys
      if (event.key === 'Enter' || event.key === '\r' || event.key === '\n') {
        this.processBuffer();
        return;
      }

      // Ignore modifier keys and function keys
      if (event.key.length > 1 && !['Backspace', 'Delete'].includes(event.key)) {
        return;
      }

      // Handle backspace
      if (event.key === 'Backspace') {
        this.buffer = this.buffer.slice(0, -1);
        return;
      }

      // Add character to buffer
      this.buffer += event.key;

      // Reset buffer timeout
      if (this.bufferTimeout) {
        clearTimeout(this.bufferTimeout);
      }

      // Auto-process buffer after timeout (in case no Enter is sent)
      this.bufferTimeout = setTimeout(() => {
        if (this.buffer.length >= 8) { // Minimum UID length
          this.processBuffer();
        }
      }, 1000);
    };

    window.addEventListener('keydown', this.keyListener);
  }

  /**
   * Process the current buffer and extract card UID
   */
  private processBuffer(): void {
    if (!this.buffer || this.buffer.length < 8) {
      this.buffer = '';
      return;
    }

    let uid = this.buffer.trim();
    
    // Remove prefix if configured
    if (this.config.prefix && uid.startsWith(this.config.prefix)) {
      uid = uid.substring(this.config.prefix.length);
    }

    // Remove suffix if configured
    if (this.config.suffix && uid.endsWith(this.config.suffix)) {
      uid = uid.substring(0, uid.length - this.config.suffix.length);
    }

    // Validate UID format (hex string, typically 8-20 characters)
    const hexPattern = /^[0-9A-Fa-f]{8,20}$/;
    if (!hexPattern.test(uid)) {
      console.warn('Invalid UID format:', uid);
      this.buffer = '';
      return;
    }

    // Create card object
    const card: RFIDCard = {
      uid: uid.toUpperCase(),
      type: this.detectCardType(uid),
      timestamp: Date.now()
    };

    // Clear buffer
    this.buffer = '';

    // Clear timeout
    if (this.bufferTimeout) {
      clearTimeout(this.bufferTimeout);
      this.bufferTimeout = undefined;
    }

    // Notify callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(card);
      } catch (error) {
        console.error('Error in RFID callback:', error);
      }
    });
  }

  /**
   * Detect card type based on UID
   */
  private detectCardType(uid: string): 'mifare' | 'ntag' | 'unknown' {
    const uidLength = uid.length;
    
    // MIFARE Classic typically has 8-character UID (4 bytes)
    // MIFARE Ultralight/NTAG typically has 14-character UID (7 bytes)
    if (uidLength === 8) {
      return 'mifare';
    } else if (uidLength === 14) {
      return 'ntag';
    }
    
    return 'unknown';
  }

  /**
   * Manually trigger card detection (for testing)
   */
  simulateCardTap(uid: string): void {
    const card: RFIDCard = {
      uid: uid.toUpperCase(),
      type: this.detectCardType(uid),
      timestamp: Date.now()
    };

    this.callbacks.forEach(callback => {
      callback(card);
    });
  }
}

import React from 'react';

/**
 * React hook for RFID reader
 */
export function useRFIDReader(config?: Partial<RFIDReaderConfig>) {
  const [isListening, setIsListening] = React.useState(false);
  const [lastCard, setLastCard] = React.useState<RFIDCard | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const readerRef = React.useRef<RFIDReader | null>(null);

  React.useEffect(() => {
    readerRef.current = new RFIDReader(config);
    
    const handleCard = (card: RFIDCard) => {
      setLastCard(card);
      setError(null);
    };

    readerRef.current.onCardDetected(handleCard);

    return () => {
      if (readerRef.current) {
        readerRef.current.removeCardDetectedCallback(handleCard);
        readerRef.current.stopListening();
      }
    };
  }, []);

  const startListening = React.useCallback(async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.startListening();
        setIsListening(true);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start RFID reader');
    }
  }, []);

  const stopListening = React.useCallback(() => {
    if (readerRef.current) {
      readerRef.current.stopListening();
      setIsListening(false);
    }
  }, []);

  const simulateCard = React.useCallback((uid: string) => {
    if (readerRef.current) {
      readerRef.current.simulateCardTap(uid);
    }
  }, []);

  return {
    isListening,
    lastCard,
    error,
    startListening,
    stopListening,
    simulateCard
  };
}

/**
 * Utility functions for working with card UIDs
 */
export const CardUtils = {
  /**
   * Format UID for display
   */
  formatUID(uid: string): string {
    return uid.replace(/(.{2})/g, '$1:').slice(0, -1);
  },

  /**
   * Generate a random UID for testing
   */
  generateTestUID(): string {
    const bytes = Array.from({ length: 4 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    );
    return bytes.join('').toUpperCase();
  },

  /**
   * Validate UID format
   */
  isValidUID(uid: string): boolean {
    return /^[0-9A-Fa-f]{8,20}$/.test(uid);
  },

  /**
   * Convert UID to bytes array
   */
  uidToBytes(uid: string): number[] {
    const bytes = [];
    for (let i = 0; i < uid.length; i += 2) {
      bytes.push(parseInt(uid.substr(i, 2), 16));
    }
    return bytes;
  },

  /**
   * Convert bytes array to UID
   */
  bytesToUID(bytes: number[]): string {
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
};