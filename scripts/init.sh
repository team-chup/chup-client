echo "GSM template for Next.js"
echo "아키텍쳐를 선택해주세요"
echo

options=("atomic" "fsd")
selected=0
total=${#options[@]}

tput civis

print_options() {
  local idx=0
  for opt in "${options[@]}"; do
    if [ $idx -eq $selected ]; then
      echo "❯ $opt"
    else
      echo "  $opt"
    fi
    idx=$((idx + 1))
  done
}

while true; do
  tput sc
  
  print_options
  
  read -sn1 key

  tput rc
  for ((i=0; i<$total; i++)); do
    tput el
    tput cud1
  done
  tput rc

  case $key in
    "A")
      if [ $selected -gt 0 ]; then
        selected=$((selected - 1))
      fi
      ;;
    "B")
      if [ $selected -lt $((total - 1)) ]; then
        selected=$((selected + 1))
      fi
      ;;
    "")
      STRUCTURE=${options[$selected]}
      break
      ;;
  esac
done

tput cnorm

echo
echo "${STRUCTURE} 구조로 설치를 시작합니다"
echo

if [ -d "./src" ]; then
  echo "기존 src 디렉토리 삭제..."
  rm -rf ./src
fi

echo "tsconfig.json 복사..."
cp "./setup/$STRUCTURE/tsconfig.json" ./tsconfig.json

echo ".prettierrc 복사..."
cp "./setup/$STRUCTURE/.prettierrc" ./.prettierrc

echo "$STRUCTURE 구조 복사..."
mkdir -p src
cp -R "./setup/$STRUCTURE/src/"* ./src/

echo "패키지 설치..."
npm install

if [ ! -f ".env.local" ]; then
  echo "환경 변수 파일 생성..."
  echo "NEXT_PUBLIC_API_URL=your_api_url" > .env.local
  echo "NEXT_PUBLIC_GA_ID=your_google_analytics_id" >> .env.local
fi

if [ $? -eq 0 ]; then
  echo "임시 파일 정리..."
  rm -rf ./setup
fi

echo
echo "설치가 완료되었습니다!"
echo ".env.local 파일의 환경 변수를 실제 값으로 수정해주세요"
echo