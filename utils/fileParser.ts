import mammoth from 'mammoth';

export const parseDocx = async (file: File): Promise<{ html: string; rawText: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error("Failed to read file"));
          return;
        }

        // Convert to HTML for viewing
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
        
        // Extract raw text for indexing/AI
        const textResult = await mammoth.extractRawText({ arrayBuffer });

        resolve({
          html: htmlResult.value,
          rawText: textResult.value
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
