import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { auth, db, ensureAnonymousUser } from './firebase-auth.js';
const form = document.getElementById('guestbook-form');
const list = document.getElementById('guest-list');
const status = document.getElementById('guest-status');
const submit = document.getElementById('guest-submit');
const nameInput = document.getElementById('guest-name');
const messageInput = document.getElementById('guest-message');
const messages = collection(db, 'guestbook');
let myUid = null;
let guestbookData = [];
function makeButton(label, action, className = '') {
  const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
  button.className = className; button.addEventListener('click', action); return button;
}
function renderGuestbook() {
  list.replaceChildren();
  if (!guestbookData.length) { const empty = document.createElement('p'); empty.textContent = '아직 작성된 방명록이 없습니다.'; list.append(empty); return; }
  guestbookData.forEach(entry => {
    const data = entry.data;
    const card = document.createElement('article'); card.className = 'guest-card';
    const title = document.createElement('strong'); title.textContent = data.name || '방문자';
    const date = document.createElement('p'); date.className = 'guest-date'; date.textContent = data.createdAt?.toDate().toLocaleString('ko-KR') || '방금 전';
    const content = document.createElement('p'); content.className = 'post-content'; content.textContent = data.message || '';
    card.append(title, date, content);
    if (myUid && data.authorUid === myUid) {
      const actions = document.createElement('div'); actions.className = 'guest-actions';
      const editButton = makeButton('수정', () => {
        if (card.querySelector('.guest-edit')) return;
        const editor = document.createElement('form'); editor.className = 'guest-edit';
        const editName = document.createElement('input'); editName.value = data.name; editName.maxLength = 20; editName.required = true;
        const editMessage = document.createElement('textarea'); editMessage.value = data.message; editMessage.maxLength = 300; editMessage.rows = 3; editMessage.required = true;
        const saveButton = document.createElement('button'); saveButton.type = 'submit'; saveButton.textContent = '저장';
        const cancelButton = makeButton('취소', () => editor.remove(), 'secondary');
        editor.append(editName, editMessage, saveButton, cancelButton);
        editor.addEventListener('submit', async event => {
          event.preventDefault(); const name = editName.value.trim(); const message = editMessage.value.trim();
          if (!name || !message || name.length > 20 || message.length > 300) return;
          saveButton.disabled = true;
          try { await updateDoc(doc(db, 'guestbook', entry.id), { name, message }); status.textContent = '방명록을 수정했습니다.'; }
          catch (error) { status.textContent = '수정 실패: ' + error.message; saveButton.disabled = false; }
        });
        card.append(editor);
      }, 'secondary');
      const deleteButton = makeButton('삭제', async () => {
        if (!confirm('이 방명록을 삭제할까요?')) return;
        deleteButton.disabled = true;
        try { await deleteDoc(doc(db, 'guestbook', entry.id)); status.textContent = '방명록을 삭제했습니다.'; }
        catch (error) { status.textContent = '삭제 실패: ' + error.message; deleteButton.disabled = false; }
      }, 'secondary');
      actions.append(editButton, deleteButton); card.append(actions);
    }
    list.append(card);
  });
}
onAuthStateChanged(auth, user => { myUid = user?.uid || null; submit.disabled = !user; renderGuestbook(); if (user) status.textContent = '방명록에 연결되었습니다.'; });
onSnapshot(query(messages, orderBy('createdAt', 'desc')), snapshot => {
  guestbookData = snapshot.docs.map(item => ({ id: item.id, data: item.data() })); renderGuestbook();
}, error => { status.textContent = '방명록 조회 실패: ' + error.message; });
form.addEventListener('submit', async event => {
  event.preventDefault(); if (!auth.currentUser) { status.textContent = 'Firebase 인증을 확인해 주세요.'; return; }
  const name = nameInput.value.trim(); const message = messageInput.value.trim();
  if (!name || !message || name.length > 20 || message.length > 300) return;
  submit.disabled = true;
  try { await addDoc(messages, { name, message, createdAt: serverTimestamp(), authorUid: auth.currentUser.uid }); form.reset(); status.textContent = '방명록을 등록했습니다.'; }
  catch (error) { status.textContent = '등록 실패: ' + error.message; }
  finally { submit.disabled = !auth.currentUser; }
});
ensureAnonymousUser().catch(error => { status.textContent = 'Firebase 인증 실패: ' + error.message; });
