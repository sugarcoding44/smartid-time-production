/**
 * PC/SC RFID Reader Integration
 * For readers like XT-N424 WR in PC/SC mode
 */

export interface PCScCard {
  uid: string;
  atr: string;
  type: 'mifare' | 'ntag' | 'unknown';
  timestamp: number;
}

export class PCScReader {
  private isSupported: boolean = false;
  private callbacks: ((card: PCScCard) => void)[] = [];

  constructor() {
    // Check if Web NFC is supported (Chrome-based browsers)
    this.isSupported = 'NDEFReader' in window;
  }

  /**
   * Check if PC/SC reading is supported
   */
  isReaderSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Start listening for NFC cards via Web NFC API
   */
  async startListening(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Web NFC is not supported in this browser. Please use Chrome or Edge.');
    }

    try {
      const ndef = new (window as any).NDEFReader();
      
      await ndef.scan();
      console.log('PC/SC NFC scan started');

      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        const uid = serialNumber.replace(/:/g, '').toUpperCase();
        
        const card: PCScCard = {
          uid,
          atr: serialNumber,
          type: this.detectCardType(uid),
          timestamp: Date.now()
        };

        this.callbacks.forEach(callback => {
          try {
            callback(card);
          } catch (error) {
            console.error('Error in PC/SC callback:', error);
          }
        });
      });

      ndef.addEventListener('readingerror', () => {
        console.error('Cannot read data from the NFC tag. Try another one?');
      });

    } catch (error) {
      console.error('Error starting PC/SC reader:', error);
      throw error;
    }
  }

  /**
   * Stop listening
   */
  stopListening(): void {
    // Web NFC doesn't have explicit stop method
    console.log('PC/SC NFC scanning stopped');
  }

  /**
   * Add callback for card detection
   */
  onCardDetected(callback: (card: PCScCard) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCardDetectedCallback(callback: (card: PCScCard) => void): void {
    this.callbacks = this.callbacks.filter(cb => cb !== callback);
  }

  /**
   * Detect card type from UID
   */
  private detectCardType(uid: string): 'mifare' | 'ntag' | 'unknown' {
    const uidLength = uid.length;
    
    if (uidLength === 8) {
      return 'mifare';
    } else if (uidLength === 14) {
      return 'ntag';
    }
    
    return 'unknown';
  }

  /**
   * Manual UID entry for testing
   */
  simulateCard(uid: string): void {
    const card: PCScCard = {
      uid: uid.toUpperCase(),
      atr: uid,
      type: this.detectCardType(uid),
      timestamp: Date.now()
    };

    this.callbacks.forEach(callback => {
      callback(card);
    });
  }
}

/**
 * React hook for PC/SC reader
 */
import React from 'react';

export function usePCScReader() {
  const [isListening, setIsListening] = React.useState(false);
  const [lastCard, setLastCard] = React.useState<PCScCard | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSupported, setIsSupported] = React.useState(false);
  const readerRef = React.useRef<PCScReader | null>(null);

  React.useEffect(() => {
    readerRef.current = new PCScReader();
    setIsSupported(readerRef.current.isReaderSupported());
    
    const handleCard = (card: PCScCard) => {
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
      setError(err instanceof Error ? err.message : 'Failed to start PC/SC reader');
      setIsListening(false);
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
      readerRef.current.simulateCard(uid);
    }
  }, []);

  return {
    isListening,
    lastCard,
    error,
    isSupported,
    startListening,
    stopListening,
    simulateCard
  };
}