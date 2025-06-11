import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  
  if (!url) {
    return new NextResponse('URL 파라미터가 필요합니다', { status: 400 });
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`서버에서 파일을 가져오지 못했습니다: ${response.status}`);
    }
    
    const blob = await response.blob();
    const headers = new Headers();
    
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    
    const filename = url.split('/').pop();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return new NextResponse(blob, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('파일 프록시 중 오류 발생:', error);
    return new NextResponse('파일을 가져오는 중 오류가 발생했습니다', { status: 500 });
  }
} 