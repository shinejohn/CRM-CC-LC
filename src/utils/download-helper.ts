// ============================================
// DOWNLOAD HELPER UTILITY
// ============================================

/**
 * Downloads a file from a URL or blob
 * @param url - The URL to download from or a Blob object
 * @param filename - The filename for the downloaded file
 * @param mimeType - Optional MIME type (default: 'application/pdf')
 */
export async function downloadFile(
  url: string | Blob,
  filename: string,
  mimeType: string = 'application/pdf'
): Promise<void> {
  try {
    let blob: Blob;

    if (url instanceof Blob) {
      blob = url;
    } else {
      // Fetch the file from URL
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': mimeType,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      blob = await response.blob();
    }

    // Create a temporary URL for the blob
    const blobUrl = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Downloads a file from a response that returns a blob
 * @param response - Fetch Response object
 * @param filename - The filename for the downloaded file
 */
export async function downloadFileFromResponse(
  response: Response,
  filename: string
): Promise<void> {
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const blob = await response.blob();
  await downloadFile(blob, filename);
}

/**
 * Downloads a PDF guide file
 * @param url - The URL to download the PDF from
 * @param campaignId - The campaign ID for filename generation
 */
export async function downloadGuide(
  url: string,
  campaignId: string
): Promise<void> {
  const filename = `guide-${campaignId}-${new Date().toISOString().split('T')[0]}.pdf`;
  await downloadFile(url, filename, 'application/pdf');
}






