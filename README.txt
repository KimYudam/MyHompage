My Homepage 2.0

1. VS Code에서 이 폴더를 엽니다.
2. images 폴더에 JPG/PNG/WEBP/GIF 사진을 직접 넣습니다.
3. index.html에서 Live Server (Go Live)를 실행합니다.
4. MY DAILY에서 관리자 로그인 후 이미지 경로를 한 줄씩 입력합니다.
   예: images/travel1.jpg
5. firestore.rules 내용은 Firebase 콘솔 > Firestore Database > Rules에서 직접 게시해야 적용됩니다.

주의:
- Firebase Storage는 사용하지 않습니다. 사진은 images 폴더에 직접 넣어야 합니다.
- 다른 방문자에게 사진을 보이려면 홈페이지와 images 폴더를 함께 배포해야 합니다.
- 이미지 파일은 ZIP에 포함되지 않았습니다. images 폴더에 본인의 사진을 넣으세요.
- 기존 Firebase 프로젝트에 연결됩니다. 기존 데이터는 변경하지 않습니다.
- 현재 홈페이지 기능은 Firebase Authentication 및 Cloud Firestore를 사용합니다.
