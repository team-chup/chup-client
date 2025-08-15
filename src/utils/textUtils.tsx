import React from 'react';

export function convertUrlsToLinks(text: string): (string | JSX.Element)[] {
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  const result: (string | JSX.Element)[] = [];
  
  parts.forEach((part, index) => {
    if (urlRegex.test(part)) {
      let url = part;
      if (part.startsWith('www.')) {
        url = `https://${part}`;
      }
      
      result.push(
        <a 
          key={index} 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {part}
        </a>
      );
    } else {
      // 일반 텍스트인 경우 그대로 추가
      result.push(part);
    }
  });
  
  return result;
}
