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

export const downloadPortfolioLinkAsTxt = (url: string, filename: string): void => {
  const content = `포트폴리오 링크: ${url}`;
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