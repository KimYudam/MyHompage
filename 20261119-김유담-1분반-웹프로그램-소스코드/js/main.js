import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { auth, db, ADMIN_UID, ensureAnonymousUser } from './firebase-auth.js';

const postsRef = collection(db, 'posts');
const loginArea = document.getElementById('admin-login-area');
const loginForm = document.getElementById('admin-login-form');
const logoutArea = document.getElementById('admin-logout-area');
const logoutButton = document.getElementById('admin-logout');
const adminStatus = document.getElementById('admin-status');
const searchInput = document.getElementById('post-search');
const filterSelect = document.getElementById('post-filter');
const postList = document.getElementById('post-list');
const recentPosts = document.getElementById('recent-posts');
const dailyForm = document.getElementById('daily-form');
const editorTitle = document.getElementById('editor-title');
const titleInput = document.getElementById('post-title');
const categoryInput = document.getElementById('post-category');
const contentInput = document.getElementById('post-content');
const imagesInput = document.getElementById('post-images');
const imagePreview = document.getElementById('image-preview');
const imageStatus = document.getElementById('image-status');
const saveButton = document.getElementById('save-post');
const cancelButton = document.getElementById('cancel-edit');
let posts = [];
let editingId = null;
let isAdmin = false;
let isSaving = false;

function makeButton(text, handler, className = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.className = className;
  button.addEventListener('click', handler);
  return button;
}
function formatDate(timestamp) { return timestamp?.toDate().toLocaleString('ko-KR') || '방금 전'; }
function getImages(data) { return Array.isArray(data.imagePaths) ? data.imagePaths : []; }
function parseImagePaths(value) { return value.split('\n').map(path => path.trim()).filter(Boolean); }
function isValidImagePath(path) {
  return /^images\/[a-zA-Z0-9가-힣_.-]+\.(jpg|jpeg|png|webp|gif)$/i.test(path) && !path.includes('..');
}
function renderImagePreview() {
  imagePreview.replaceChildren();
  const paths = parseImagePaths(imagesInput.value);
  if (paths.length > 5) { imageStatus.textContent = '사진은 최대 5장까지 첨부할 수 있습니다.'; return; }
  const invalid = paths.find(path => !isValidImagePath(path));
  if (invalid) { imageStatus.textContent = '이미지 경로를 확인해 주세요: ' + invalid; return; }
  imageStatus.textContent = '';
  paths.forEach(path => {
    const img = document.createElement('img');
    img.src = path;
    img.alt = '첨부 이미지 미리보기';
    img.addEventListener('error', () => { imageStatus.textContent = '이미지를 찾을 수 없습니다: ' + path; });
    imagePreview.append(img);
  });
}
imagesInput.addEventListener('input', renderImagePreview);
function resetEditor() {
  dailyForm.reset(); editingId = null;
  editorTitle.textContent = '새 글 작성'; saveButton.textContent = '등록하기'; cancelButton.hidden = true;
  imagePreview.replaceChildren(); imageStatus.textContent = '';
}
function openEditor(post) {
  if (!isAdmin || isSaving) return;
  resetEditor(); editingId = post.id;
  titleInput.value = post.data.title || '';
  categoryInput.value = post.data.category || 'DAILY';
  contentInput.value = post.data.content || '';
  imagesInput.value = getImages(post.data).join('\n');
  editorTitle.textContent = '게시글 수정'; saveButton.textContent = '수정 완료'; cancelButton.hidden = false;
  renderImagePreview(); dailyForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
cancelButton.addEventListener('click', resetEditor);
function renderPosts() {
  postList.replaceChildren();
  const keyword = searchInput.value.trim().toLowerCase();
  const selectedCategory = filterSelect.value;
  const filtered = posts.filter(post => {
    const data = post.data;
    return ((data.title || '').toLowerCase().includes(keyword) || (data.content || '').toLowerCase().includes(keyword))
      && (selectedCategory === 'all' || data.category === selectedCategory);
  });
  if (!filtered.length) { const empty = document.createElement('p'); empty.textContent = '게시글이 없습니다.'; postList.append(empty); return; }
  filtered.forEach(post => {
    const data = post.data;
    const article = document.createElement('article'); article.className = 'daily-post';
    const category = document.createElement('span'); category.className = 'post-category'; category.textContent = data.category || 'DAILY';
    const title = document.createElement('h3'); title.textContent = data.title || '제목 없음';
    const date = document.createElement('p'); date.className = 'guest-date'; date.textContent = formatDate(data.createdAt);
    const content = document.createElement('p'); content.className = 'post-content'; content.textContent = data.content || '';
    article.append(category, title, date);
    const images = getImages(data);
    if (images.length) {
      const gallery = document.createElement('div'); gallery.className = 'post-gallery';
      images.forEach(path => { if (!isValidImagePath(path)) return; const img = document.createElement('img'); img.src = path; img.alt = '게시글 첨부 사진'; img.loading = 'lazy'; gallery.append(img); });
      article.append(gallery);
    }
    article.append(content);
    if (isAdmin) {
      const actions = document.createElement('div'); actions.className = 'actions';
      const editButton = makeButton('수정', () => openEditor(post), 'secondary');
      const deleteButton = makeButton('삭제', async () => {
        if (!confirm('게시글을 삭제할까요?')) return;
        deleteButton.disabled = true;
        try { await deleteDoc(doc(db, 'posts', post.id)); adminStatus.textContent = '게시글을 삭제했습니다.'; }
        catch (error) { adminStatus.textContent = '삭제 실패: ' + error.message; deleteButton.disabled = false; }
      }, 'secondary');
      actions.append(editButton, deleteButton); article.append(actions);
    }
    postList.append(article);
  });
}
function renderRecentPosts() {
  recentPosts.replaceChildren();
  if (!posts.length) { const li = document.createElement('li'); li.textContent = '아직 작성한 글이 없습니다.'; recentPosts.append(li); return; }
  posts.slice(0, 5).forEach(post => {
    const li = document.createElement('li'); const link = document.createElement('a'); link.href = '#daily'; link.textContent = post.data.title || '제목 없음';
    link.addEventListener('click', () => { searchInput.value = post.data.title || ''; filterSelect.value = 'all'; renderPosts(); });
    li.append(link); recentPosts.append(li);
  });
}
searchInput.addEventListener('input', renderPosts);
filterSelect.addEventListener('change', renderPosts);
onSnapshot(query(postsRef, orderBy('createdAt', 'desc')), snapshot => {
  posts = snapshot.docs.map(item => ({ id: item.id, data: item.data() })); renderPosts(); renderRecentPosts();
}, error => { postList.textContent = '게시글 조회 실패: ' + error.message; });
onAuthStateChanged(auth, user => {
  isAdmin = user?.uid === ADMIN_UID;
  loginArea.hidden = isAdmin; logoutArea.hidden = !isAdmin; dailyForm.hidden = !isAdmin;
  if (!isAdmin) resetEditor(); renderPosts();
});
loginForm.addEventListener('submit', async event => {
  event.preventDefault();
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    if (credential.user.uid !== ADMIN_UID) { await signOut(auth); await ensureAnonymousUser(); adminStatus.textContent = '관리자 계정이 아닙니다.'; return; }
    loginForm.reset(); adminStatus.textContent = '관리자 로그인 성공';
  } catch (error) { adminStatus.textContent = '로그인 실패: ' + error.message; }
});
logoutButton.addEventListener('click', async () => {
  try { await signOut(auth); await ensureAnonymousUser(); adminStatus.textContent = '로그아웃되었습니다.'; }
  catch (error) { adminStatus.textContent = '로그아웃 실패: ' + error.message; }
});
dailyForm.addEventListener('submit', async event => {
  event.preventDefault(); if (!isAdmin || isSaving) return;
  const title = titleInput.value.trim(); const category = categoryInput.value;
  const content = contentInput.value.trim(); const imagePaths = parseImagePaths(imagesInput.value);
  if (!title || !content) { alert('제목과 내용을 입력해 주세요.'); return; }
  if (imagePaths.length > 5) { imageStatus.textContent = '사진은 최대 5장까지 첨부할 수 있습니다.'; return; }
  if (!imagePaths.every(isValidImagePath)) { imageStatus.textContent = '이미지 경로 형식을 확인해 주세요.'; return; }
  isSaving = true; saveButton.disabled = true;
  try {
    if (editingId) { await updateDoc(doc(db, 'posts', editingId), { title, category, content, imagePaths }); adminStatus.textContent = '게시글을 수정했습니다.'; }
    else { await addDoc(postsRef, { title, category, content, imagePaths, createdAt: serverTimestamp() }); adminStatus.textContent = '게시글을 등록했습니다.'; }
    resetEditor(); window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) { imageStatus.textContent = '저장 실패: ' + error.message; }
  finally { isSaving = false; saveButton.disabled = false; }
});
ensureAnonymousUser().catch(error => { adminStatus.textContent = '인증 실패: ' + error.message; });
