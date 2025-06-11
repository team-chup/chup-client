export const forceDownload = async (url: string, filename: string): Promise<void> => {
  try {
    const cleanUrl = url.startsWith('@') ? url.substring(1) : url;
    
    const isS3Url = cleanUrl.includes('s3.ap-northeast-2.amazonaws.com');
    
    const fetchUrl = isS3Url 
      ? `/api/proxy?url=${encodeURIComponent(cleanUrl)}`
      : cleanUrl;
    
    const response = await fetch(fetchUrl, {
      method: 'GET',
      cache: 'no-cache',
    });
    
    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
    
    return Promise.resolve();
  } catch (error) {
    console.error('다운로드 중 오류 발생:', error);
    
    window.open(url, '_blank');
    
    return Promise.reject(error);
  }
};

export const downloadLinkAsTxt = (url: string, filename: string): void => {
  const content = `이력서 링크: ${url}`;
  const blob = new Blob([content], {type: 'text/plain'});
  const blobUrl = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${filename}.txt`;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
};

export const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms)); 