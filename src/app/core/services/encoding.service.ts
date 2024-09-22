import { Injectable } from '@angular/core';

@Injectable()
export class EncodingService {
  // Converts uint8array binary to base64 string
  uint8ArrayToBase64(binary: Uint8Array): string {
    return btoa(new Uint8Array(binary).reduce((data, byte) => {
      return data + String.fromCharCode(byte);
    }, ''));
  }

  // Converts base64 string to uint8array binary
  base64ToUint8Array(base64: string): Uint8Array {
    const raw: string = window.atob(base64);
    const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) {
      uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
  }

  uint32ToUint8Array(uint32: number): Uint8Array {
    return Uint8Array.of(
      (uint32 & 0xff000000) >> 24,
      (uint32 & 0x00ff0000) >> 16,
      (uint32 & 0x0000ff00) >> 8,
      (uint32 & 0x000000ff) >> 0,
    );
  }

  uint8ArrayToUint32(bytes: Uint8Array): number {
    let n: number = 0;
    for (const byte of bytes.values()) {
      n = (n << 8) | byte;
    }
    return n >>> 0;
  }

  uint8ArrayToUint32Signed(bytes: Uint8Array): number {
    let n: number = 0;
    for (const byte of bytes.values()) {
      n = (n << 8) | byte;
    }
    return n | 0;
  }

  uint8ArrayToFloat32(bytes: Uint8Array): number {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);

    // Copy bytes into the buffer
    bytes.forEach((b, i) => {
      view.setUint8(i, b);
    });

    // Read the float value from the buffer
    return view.getFloat32(0, true);
  }

  // Decimal number to hex little endian
  numToHex(decimal: number, size: number = 4): string {
    // Convert to hex and pad with leading zeros to make it 2 * size characters
    const hex = decimal.toString(16).padStart(2 * size, '0');
    // Split the hex string into bytes
    const bytes = hex.match(/../g);
    // Reverse the byte order for little-endian format
    bytes.reverse();
    // Join the bytes back into a single string
    return bytes.join('');
  }
}
