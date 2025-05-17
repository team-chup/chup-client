if [ -z "$1" ]; then
  echo "bash scripts/init.sh [atomic|fsd]"
  exit 1
fi

STRUCTURE=$(echo "$1" | tr '[:upper:]' '[:lower:]')

if [ "$STRUCTURE" != "atomic" ] && [ "$STRUCTURE" != "fsd" ]; then
  echo "프로젝트 아키텍쳐로는 'atomic' 또는 'fsd'만 사용할 수 있어요 ㅠㅠ"
  exit 1
fi

if [ -d "./src" ]; then
  rm -rf ./src
fi

echo "copy tsconfig.json"
cp "./setup/$STRUCTURE/tsconfig.json" ./tsconfig.json

echo "copy .prettierrc"
cp "./setup/$STRUCTURE/.prettierrc" ./.prettierrc

echo "copy $STRUCTURE"
mkdir -p src
cp -R "./setup/$STRUCTURE/src/"* ./src/

echo "npm install"
npm install

if [ ! -f ".env.local" ]; then
  echo "create .env.local"
  echo "NEXT_PUBLIC_API_URL=your_api_url" > .env.local
  echo "NEXT_PUBLIC_GA_ID=your_google_analytics_id" >> .env.local
fi

if [ $? -eq 0 ]; then
  echo "remove setup directory"
  rm -rf ./setup
fi

echo "완료되었습니다!"
echo ".env.local을 실제 API URL과 Google Analytics ID로 업데이트해주세요"
