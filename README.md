# My Homepage 2.0

기존 개인 홈페이지에 일상 블로그와 Firebase 방명록을 추가한 웹프로그래밍 과제입니다.

## 실행
1. VS Code에서 폴더를 열고 Live Server 확장으로 `index.html`을 실행합니다. (`file://`로 열지 마세요.)
2. MY DAILY는 별도 설정 없이 작동하며, 게시글은 해당 브라우저의 LocalStorage에 저장됩니다.
3. GUESTBOOK을 사용하려면 Firebase 콘솔에서 프로젝트 및 웹 앱을 생성합니다.
4. Authentication > Sign-in method에서 **Anonymous(익명)** 로그인을 활성화합니다.
5. Firestore Database를 생성하고 `firestore.rules`의 내용을 Firestore Rules에 게시합니다. **테스트 모드의 공개 규칙을 그대로 사용하지 마세요.**
6. 프로젝트 설정 > 내 앱 > SDK 설정 및 구성에서 `firebaseConfig` 값을 복사해 `js/firebase-config.js`에 입력합니다.
7. Live Server에서 다시 실행합니다. 실제 친구가 접속하려면 GitHub Pages 등 HTTPS 웹 호스팅에 배포해야 합니다.

## 주의사항
- 방명록은 누구나 읽을 수 있으며, 익명 로그인한 방문자가 새 메시지를 작성할 수 있습니다. 웹사이트에서 수정/삭제는 불가능하도록 설정했습니다. 관리자는 Firebase 콘솔에서 부적절한 메시지를 삭제할 수 있습니다.
- 익명 인증만으로는 스팸을 완전히 막을 수 없습니다. 공개 배포 시 Firebase App Check, 사용량 모니터링, 스팸 방지 정책 등을 추가 검토하세요.
- 방명록 메시지는 개인정보가 포함되지 않도록 안내하세요. Firebase 요금제 및 사용량 한도를 확인하세요.
- MY DAILY는 로컬 저장 방식이므로 다른 브라우저/기기와 동기화되지 않습니다.
- Firebase 설정값은 클라이언트에 공개되는 값이므로 보안은 반드시 Firestore Rules로 제어합니다. 서비스 계정 비밀 키는 웹 코드에 넣지 마세요.

## 참고
- 수업 교재: HTML5 종합 예제의 시맨틱 구조, CSS 레이아웃, 드롭다운 메뉴
- https://developer.mozilla.org/ko/docs/Web/API/Window/localStorage
- https://firebase.google.com/docs/firestore/quickstart
- https://firebase.google.com/docs/auth/web/anonymous-auth
- https://firebase.google.com/docs/firestore/security/get-started

## 방명록 수정 및 삭제
방문자는 Firebase 익명 인증으로 작성한 자신의 글만 수정·삭제할 수 있습니다.
Firestore Database > 규칙에서 `firestore.rules` 전체를 붙여넣고 게시해야 합니다.
기존 문서의 작성자 필드는 `authorUid`여야 합니다.
Firebase 콘솔의 프로젝트 관리자는 개별 문서를 직접 삭제할 수 있습니다.
