import mammoth from 'mammoth';

export const parseDocx = async (file: File): Promise<{ rawText: string; fileData: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }

        // 1. Get Raw Text for AI indexing (using mammoth)
        const textResult = await mammoth.extractRawText({ arrayBuffer });
        
        // 2. Convert ArrayBuffer to Base64 for storage and faithful rendering later
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = window.btoa(binary);

        resolve({
          rawText: textResult.value,
          fileData: base64
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};