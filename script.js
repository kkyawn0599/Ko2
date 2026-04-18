// 全局变量
let currentPage = 'study';
let currentTheme = 'pink';
let currentWordIndex = 0;
let shuffledWords = [];
let currentBook = '默认词书';
let isLoggedIn = false;
let currentUser = null;
let firebaseUser = null;

// 主题颜色映射
const themes = {
  pink: 'theme-pink',
  blue: 'theme-blue',
  mint: 'theme-mint',
  purple: 'theme-purple',
  yellow: 'theme-yellow'
};

// Firebase 配置
// 注意：请替换为您自己的Firebase项目配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// 初始化 Firebase
let app, auth, db;
try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  console.log('Firebase 初始化成功');
} catch (error) {
  console.error('Firebase 初始化失败:', error);
  // 即使 Firebase 初始化失败，网站的其他功能仍然可以正常工作
}

// 初始化页面
function init() {
  // 加载保存的主题
  loadTheme();
  
  // 加载用户信息
  loadUser();
  
  // 加载单词数据
  loadWords();
  
  // 初始化词书选择
  initBookSelection();
  
  // 初始化乱序单词
  shuffleWords();
  
  // 绑定事件监听器
  bindEventListeners();
  
  // 初始化页面
  showPage('study');
  
  // 显示第一个单词
  showWord(currentWordIndex);
  
  // 更新单词列表
  updateWordList();
  
  // 初始化个人主页
  initProfilePage();
  
  // 初始化语音选择
  initVoiceSelection();
}

// 绑定事件监听器
function bindEventListeners() {
  // 页面切换
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const page = this.getAttribute('data-page');
      showPage(page);
    });
  });
  
  // 单词搜索
  const wordSearch = document.getElementById('wordSearch');
  if (wordSearch) {
    wordSearch.addEventListener('input', updateWordList);
  }
  
  // 主题按钮
  document.getElementById('themeBtn').addEventListener('click', function() {
    document.getElementById('themeModal').classList.add('show');
  });
  
  // 关闭主题模态框
  document.getElementById('closeThemeModalBtn').addEventListener('click', function() {
    document.getElementById('themeModal').classList.remove('show');
  });
  
  // 主题选择
  document.querySelectorAll('.theme-item').forEach(item => {
    item.addEventListener('click', function() {
      const theme = this.getAttribute('data-theme');
      setTheme(theme);
      document.getElementById('themeModal').classList.remove('show');
    });
  });
  
  // 登录按钮
  document.getElementById('loginBtn').addEventListener('click', function() {
    document.getElementById('loginModal').classList.add('show');
  });
  
  // 关闭登录模态框
  document.getElementById('closeModalBtn').addEventListener('click', function() {
    document.getElementById('loginModal').classList.remove('show');
  });
  
  // 切换登录/注册表单
  document.getElementById('switchToRegister').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('modalTitle').textContent = '注册';
  });
  
  document.getElementById('switchToLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('modalTitle').textContent = '登录';
  });
  
  // 登录表单提交
  document.getElementById('submitLoginBtn').addEventListener('click', function() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (email && password) {
      login(email, password, rememberMe);
    }
  });
  
  // 注册表单提交
  document.getElementById('submitRegisterBtn').addEventListener('click', function() {
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const nickname = document.getElementById('regNickname').value;
    
    if (email && password && nickname) {
      register(email, password, nickname);
    }
  });
  
  // 导入方法切换
  document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const method = this.getAttribute('data-method');
      document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      if (method === 'text') {
        document.getElementById('text-import').style.display = 'block';
        document.getElementById('file-import').style.display = 'none';
      } else {
        document.getElementById('text-import').style.display = 'none';
        document.getElementById('file-import').style.display = 'block';
      }
    });
  });
  
  // 单词列表折叠
  document.getElementById('toggleListBtn').addEventListener('click', function() {
    const wordList = document.getElementById('wordList');
    wordList.classList.toggle('collapsed');
    this.textContent = wordList.classList.contains('collapsed') ? '展开' : '折叠';
  });
  
  // 词书选择
  document.getElementById('bookSelect').addEventListener('change', function() {
    currentBook = this.value;
    shuffleWords();
    currentWordIndex = 0;
    showWord(currentWordIndex);
    updateWordList();
  });
  
  document.getElementById('studyBookSelect').addEventListener('change', function() {
    currentBook = this.value;
    shuffleWords();
    currentWordIndex = 0;
    showWord(currentWordIndex);
  });
  
  // 添加词书
  document.getElementById('addBookBtn').addEventListener('click', addBook);
  
  // 导入单词
  document.getElementById('importBtn').addEventListener('click', importWords);
  
  // 导入文件
  document.getElementById('importFileBtn').addEventListener('click', function() {
    document.getElementById('fileInput').click();
  });
  
  document.getElementById('fileInput').addEventListener('change', importFromFile);
  
  // 导出单词
  document.getElementById('exportBtn').addEventListener('click', exportWords);
  
  // 自动同步
  document.getElementById('syncBtn').addEventListener('click', generateSyncLink);
  
  // 背词功能
  document.getElementById('showBtn').addEventListener('click', toggleCard);
  document.getElementById('prevBtn').addEventListener('click', prevWord);
  document.getElementById('nextBtn').addEventListener('click', nextWord);
  document.getElementById('playBtn').addEventListener('click', playPronunciation);
  
  // 单词标记
  document.getElementById('knowBtn').addEventListener('click', function() {
    markWord(currentWordIndex, 'know');
  });
  
  document.getElementById('unknownBtn').addEventListener('click', function() {
    markWord(currentWordIndex, 'unknown');
  });
  
  // 语音选择
  document.getElementById('voiceSelect').addEventListener('change', function() {
    localStorage.setItem('selectedVoice', this.value);
  });
  
  // 跳转到资料编辑页面
  document.getElementById('editProfileBtn').addEventListener('click', function() {
    showPage('edit-profile');
    initEditProfilePage();
  });
  
  // 取消编辑
  document.getElementById('cancelEditBtn').addEventListener('click', function() {
    showPage('profile');
  });
  
  // 保存资料
  document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);
  
  // 上传头像
  document.getElementById('uploadAvatarBtn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('editAvatar').src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
      document.body.removeChild(input);
    };
    
    input.click();
  });
  
  // 上传封面
  document.getElementById('uploadCoverBtn').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const coverPhoto = document.getElementById('editCoverPhoto');
          coverPhoto.style.backgroundImage = `url(${e.target.result})`;
        };
        reader.readAsDataURL(file);
      }
      document.body.removeChild(input);
    };
    
    input.click();
  });
}

// 页面切换
function showPage(page) {
  // 隐藏所有页面
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // 显示选中页面
  document.getElementById(`${page}-page`).classList.add('active');
  
  // 更新导航栏
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-page') === page) {
      link.classList.add('active');
    }
  });
  
  currentPage = page;
  
  // 如果切换到背词页面，刷新单词列表
  if (page === 'study') {
    shuffleWords();
    currentWordIndex = 0;
    showWord(currentWordIndex);
  }
  
  // 如果切换到个人主页，更新个人信息
  if (page === 'profile') {
    updateProfileInfo();
  }
}

// 设置主题
function setTheme(theme) {
  // 移除所有主题类
  Object.values(themes).forEach(t => {
    document.body.classList.remove(t);
  });
  
  // 添加选中的主题类
  document.body.classList.add(themes[theme]);
  
  // 更新当前主题
  currentTheme = theme;
  
  // 保存主题设置
  localStorage.setItem('theme', theme);
  
  // 更新主题选择器
  document.querySelectorAll('.theme-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-theme') === theme) {
      item.classList.add('active');
    }
  });
}

// 加载主题
function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'pink';
  setTheme(savedTheme);
}

// 初始化词书选择
function initBookSelection() {
  const bookSelect = document.getElementById('bookSelect');
  const studyBookSelect = document.getElementById('studyBookSelect');
  
  bookSelect.innerHTML = '';
  studyBookSelect.innerHTML = '';
  
  books.forEach(book => {
    const option1 = document.createElement('option');
    option1.value = book;
    option1.textContent = book;
    if (book === currentBook) {
      option1.selected = true;
    }
    bookSelect.appendChild(option1);
    
    const option2 = document.createElement('option');
    option2.value = book;
    option2.textContent = book;
    if (book === currentBook) {
      option2.selected = true;
    }
    studyBookSelect.appendChild(option2);
  });
}

// 添加词书
function addBook() {
  const bookName = prompt('请输入词书名称：');
  if (bookName && bookName.trim()) {
    if (!books.includes(bookName.trim())) {
      books.push(bookName.trim());
      saveWords();
      initBookSelection();
      alert('词书添加成功！');
    } else {
      alert('词书名称已存在！');
    }
  }
}

// 打乱单词顺序
function shuffleWords() {
  // 筛选当前词书的单词索引
  const bookWordIndices = words
    .map((_, index) => index)
    .filter(index => words[index].book === currentBook);
  
  // 打乱索引
  for (let i = bookWordIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bookWordIndices[i], bookWordIndices[j]] = [bookWordIndices[j], bookWordIndices[i]];
  }
  
  shuffledWords = bookWordIndices;
  
  // 更新单词进度
  updateWordProgress();
}

// 更新单词进度
function updateWordProgress() {
  const progress = document.getElementById('wordProgress');
  if (progress) {
    progress.textContent = `${currentWordIndex + 1}/${shuffledWords.length}`;
  }
}

// 显示单词
function showWord(index) {
  if (shuffledWords.length === 0) return;
  
  const actualIndex = shuffledWords[index];
  const word = words[actualIndex];
  
  document.getElementById('koreanWord').textContent = word.korean;
  document.getElementById('chineseMeaning').textContent = word.chinese;
  document.getElementById('pronunciation').textContent = word.pronunciation || '';
  
  // 重置卡片状态
  const card = document.querySelector('.word-card');
  card.classList.remove('flipped');
  
  // 更新单词进度
  updateWordProgress();
}

// 翻转卡片
function toggleCard() {
  const card = document.querySelector('.word-card');
  card.classList.toggle('flipped');
}

// 上一个单词
function prevWord() {
  if (shuffledWords.length === 0) return;
  
  currentWordIndex = (currentWordIndex - 1 + shuffledWords.length) % shuffledWords.length;
  showWord(currentWordIndex);
}

// 下一个单词
function nextWord() {
  if (shuffledWords.length === 0) return;
  
  currentWordIndex = (currentWordIndex + 1) % shuffledWords.length;
  showWord(currentWordIndex);
}

// 播放发音
function playPronunciation() {
  if (shuffledWords.length === 0) return;
  
  const actualIndex = shuffledWords[currentWordIndex];
  const word = words[actualIndex];
  const selectedVoice = document.getElementById('voiceSelect').value;
  const speed = parseFloat(document.getElementById('speedRange').value);
  
  const utterance = new SpeechSynthesisUtterance(word.korean);
  utterance.lang = 'ko-KR';
  utterance.rate = speed;
  
  // 固定使用指定的语音参数
  if (selectedVoice === 'male') {
    // 男声设置
    utterance.pitch = 0.8;
    utterance.volume = 1;
  } else {
    // 女声设置（默认）
    utterance.pitch = 1.2;
    utterance.volume = 1;
  }
  
  speechSynthesis.speak(utterance);
}

// 标记单词
function markWord(index, status) {
  if (shuffledWords.length === 0) return;
  
  const actualIndex = shuffledWords[index];
  words[actualIndex].status = status;
  
  // 保存单词
  saveWords();
  
  // 生成复习词书
  generateReviewBook();
  
  // 显示下一个单词
  nextWord();
}

// 生成复习词书
function generateReviewBook() {
  // 检查是否存在复习词书
  if (!books.includes('复习词书')) {
    books.push('复习词书');
  }
  
  // 清空复习词书中的单词
  words = words.filter(word => word.book !== '复习词书');
  
  // 添加不太会的单词到复习词书
  const unknownWords = words.filter(word => word.status === 'unknown');
  unknownWords.forEach(word => {
    words.push({
      ...word,
      book: '复习词书'
    });
  });
  
  // 保存单词
  saveWords();
  
  // 更新词书选择
  initBookSelection();
}

// 导入单词
function importWords() {
  const input = document.getElementById('wordInput').value;
  
  if (!input.trim()) {
    alert('请输入单词！');
    return;
  }
  
  const lines = input.trim().split('\n');
  let addedCount = 0;
  let updatedCount = 0;
  
  lines.forEach(line => {
    if (line.trim()) {
      // 尝试用不同的分隔符分割
      let parts = line.split(',');
      if (parts.length < 2) {
        parts = line.split('，'); // 中文逗号
      }
      if (parts.length < 2) {
        parts = line.split(' '); // 空格
      }
      
      if (parts.length >= 2) {
        const korean = parts[0].trim();
        const chinese = parts[1].trim();
        const pronunciation = parts[2] ? parts[2].trim() : '';
        
        // 查找是否已存在相同的单词（同一词书内）
        const existingIndex = words.findIndex(word => word.korean === korean && word.book === currentBook);
        
        if (existingIndex === -1) {
          // 不存在，添加新单词
          words.push({ korean, chinese, pronunciation, book: currentBook });
          addedCount++;
        } else {
          // 存在，检查中文意思是否相同
          if (words[existingIndex].chinese !== chinese) {
            // 意思不同，合并
            words[existingIndex].chinese += `；${chinese}`;
            // 如果有新的发音，更新发音
            if (pronunciation) {
              words[existingIndex].pronunciation = pronunciation;
            }
            updatedCount++;
          }
        }
      }
    }
  });
  
  // 保存单词
  saveWords();
  
  // 重新打乱单词顺序
  shuffleWords();
  
  // 清空输入框
  document.getElementById('wordInput').value = '';
  
  // 更新单词列表
  updateWordList();
  
  // 显示最新导入的单词
  if (shuffledWords.length > 0) {
    currentWordIndex = 0;
    showWord(currentWordIndex);
  }
  
  // 显示成功消息
  if (addedCount > 0 || updatedCount > 0) {
    alert(`成功导入 ${addedCount} 个单词，更新 ${updatedCount} 个单词！`);
  } else {
    alert('没有导入任何单词，请检查输入格式！');
  }
}

// 从文件导入单词
function importFromFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const lines = content.split('\n');
    let addedCount = 0;
    let updatedCount = 0;
    
    lines.forEach(line => {
      if (line.trim()) {
        // 尝试用不同的分隔符分割
        let parts = line.split(',');
        if (parts.length < 2) {
          parts = line.split('，'); // 中文逗号
        }
        if (parts.length < 2) {
          parts = line.split(' '); // 空格
        }
        
        if (parts.length >= 2) {
          const korean = parts[0].trim();
          const chinese = parts[1].trim();
          const pronunciation = parts[2] ? parts[2].trim() : '';
          
          // 查找是否已存在相同的单词（同一词书内）
          const existingIndex = words.findIndex(word => word.korean === korean && word.book === currentBook);
          
          if (existingIndex === -1) {
            // 不存在，添加新单词
            words.push({ korean, chinese, pronunciation, book: currentBook });
            addedCount++;
          } else {
            // 存在，检查中文意思是否相同
            if (words[existingIndex].chinese !== chinese) {
              // 意思不同，合并
              words[existingIndex].chinese += `；${chinese}`;
              // 如果有新的发音，更新发音
              if (pronunciation) {
                words[existingIndex].pronunciation = pronunciation;
              }
              updatedCount++;
            }
          }
        }
      }
    });
    
    // 保存单词
    saveWords();
    
    // 重新打乱单词顺序
    shuffleWords();
    
    // 清空文件输入
    e.target.value = '';
    
    // 更新单词列表
    updateWordList();
    
    // 显示最新导入的单词
    if (shuffledWords.length > 0) {
      currentWordIndex = 0;
      showWord(currentWordIndex);
    }
    
    // 显示成功消息
    if (addedCount > 0 || updatedCount > 0) {
      alert(`成功导入 ${addedCount} 个单词，更新 ${updatedCount} 个单词！`);
    } else {
      alert('没有导入任何单词，请检查文件格式！');
    }
  };
  reader.readAsText(file);
}

// 导出单词
function exportWords() {
  const dataStr = JSON.stringify(words, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `korean-words-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// 生成同步链接
function generateSyncLink() {
  const dataStr = JSON.stringify(words);
  const encodedData = btoa(dataStr);
  const syncUrl = `${window.location.origin}${window.location.pathname}?sync=${encodedData}`;
  
  // 复制链接到剪贴板
  navigator.clipboard.writeText(syncUrl).then(() => {
    alert('同步链接已复制到剪贴板，请在其他设备上打开该链接以同步单词！');
  }).catch(err => {
    console.error('复制失败:', err);
    // 如果复制失败，显示链接
    prompt('请复制以下链接到其他设备:', syncUrl);
  });
}

// 检查URL参数中的同步数据
function checkSyncData() {
  const urlParams = new URLSearchParams(window.location.search);
  const syncData = urlParams.get('sync');
  
  if (syncData) {
    try {
      const decodedData = atob(syncData);
      const importedWords = JSON.parse(decodedData);
      
      if (Array.isArray(importedWords)) {
        words = importedWords;
        // 提取词书列表
        const bookSet = new Set(importedWords.map(word => word.book));
        books = Array.from(bookSet);
        if (!books.includes('默认词书')) {
          books.push('默认词书');
        }
        saveWords();
        shuffleWords();
        alert('单词同步成功！');
      }
    } catch (error) {
      console.error('同步数据解析失败:', error);
    }
  }
}

// 更新单词列表
function updateWordList() {
  const wordList = document.getElementById('wordList');
  const wordCount = document.getElementById('wordCount');
  const searchInput = document.getElementById('wordSearch');
  
  // 只显示当前词书的单词
  let bookWords = words.filter(word => word.book === currentBook);
  
  // 应用搜索过滤
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  if (searchTerm) {
    bookWords = bookWords.filter(word => 
      word.korean.toLowerCase().includes(searchTerm) || 
      word.chinese.toLowerCase().includes(searchTerm) ||
      (word.pronunciation && word.pronunciation.toLowerCase().includes(searchTerm))
    );
  }
  
  // 更新单词数量
  if (wordCount) {
    wordCount.textContent = `${bookWords.length} 个单词`;
  }
  
  // 清空单词列表
  wordList.innerHTML = '';
  
  // 显示单词
  bookWords.forEach((word, index) => {
    const wordItem = document.createElement('div');
    wordItem.className = 'word-item';
    
    // 找到单词在原始数组中的索引
    const originalIndex = words.findIndex(w => w.korean === word.korean && w.book === word.book);
    
    wordItem.innerHTML = `
      <div class="korean">${word.korean}</div>
      <div class="chinese">${word.chinese}</div>
      <div class="pronunciation">${word.pronunciation || ''}</div>
      <button class="delete-word-btn" onclick="deleteWord(${originalIndex})">删除</button>
    `;
    
    // 点击单词项跳转到该单词
    wordItem.addEventListener('click', (e) => {
      // 防止点击删除按钮时触发单词选择
      if (!e.target.classList.contains('delete-word-btn')) {
        // 找到该单词在shuffledWords中的索引
        const shuffledIndex = shuffledWords.indexOf(originalIndex);
        if (shuffledIndex !== -1) {
          currentWordIndex = shuffledIndex;
          showWord(currentWordIndex);
          // 切换到背词页面
          showPage('study');
        }
      }
    });
    
    wordList.appendChild(wordItem);
  });
}

// 删除单词
function deleteWord(index) {
  if (confirm(`确定要删除单词「${words[index].korean}」吗？`)) {
    words.splice(index, 1);
    saveWords();
    shuffleWords();
    updateWordList();
    // 如果删除的是当前显示的单词，显示下一个
    if (currentWordIndex >= shuffledWords.length) {
      currentWordIndex = 0;
    }
    showWord(currentWordIndex);
    alert('单词删除成功！');
  }
}

// 初始化语音选择
function initVoiceSelection() {
  const voiceSelect = document.getElementById('voiceSelect');
  const speedRange = document.getElementById('speedRange');
  
  // 加载保存的设置
  const savedVoice = localStorage.getItem('selectedVoice') || 'female';
  const savedSpeed = localStorage.getItem('speechSpeed') || '1';
  
  voiceSelect.value = savedVoice;
  speedRange.value = savedSpeed;
  
  // 保存语音选择
  voiceSelect.addEventListener('change', function() {
    localStorage.setItem('selectedVoice', this.value);
  });
  
  // 保存语速设置
  speedRange.addEventListener('input', function() {
    localStorage.setItem('speechSpeed', this.value);
  });
}

// 登录
function login(email, password, rememberMe) {
  if (auth) {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // 登录成功
        firebaseUser = userCredential.user;
        loadUserData();
        updateLoginStatus();
        document.getElementById('loginModal').classList.remove('show');
        alert('登录成功！');
      })
      .catch((error) => {
        // 登录失败
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('登录失败：' + errorMessage);
      });
  } else {
    // Firebase 未初始化，使用本地存储
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      currentUser = user;
      isLoggedIn = true;
      
      if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      updateLoginStatus();
      document.getElementById('loginModal').classList.remove('show');
      alert('登录成功！');
    } else {
      alert('邮箱或密码错误！');
    }
  }
}

// 注册
function register(email, password, nickname) {
  if (auth) {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // 注册成功
        firebaseUser = userCredential.user;
        // 创建用户资料
        const newUser = {
          id: firebaseUser.uid,
          email,
          nickname,
          username: email.split('@')[0],
          bio: '这个人很懒，什么都没写',
          location: '未知',
          avatar: 'https://via.placeholder.com/100',
          coverPhoto: '',
          连续打卡: 0,
          掌握单词: 0,
          学习天数: 0,
          成就: []
        };
        // 保存用户资料到Firestore
        if (db) {
          db.collection('users').doc(firebaseUser.uid).set(newUser)
            .then(() => {
              currentUser = newUser;
              isLoggedIn = true;
              updateLoginStatus();
              document.getElementById('loginModal').classList.remove('show');
              alert('注册成功！');
            })
            .catch((error) => {
              alert('保存用户资料失败：' + error.message);
            });
        } else {
          alert('Firebase 未初始化，注册失败！');
        }
      })
      .catch((error) => {
        // 注册失败
        const errorCode = error.code;
        const errorMessage = error.message;
        alert('注册失败：' + errorMessage);
      });
  } else {
    // Firebase 未初始化，使用本地存储
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 检查邮箱是否已存在
    if (users.some(u => u.email === email)) {
      alert('邮箱已存在！');
      return;
    }
    
    const newUser = {
      id: Date.now(),
      email,
      password,
      nickname,
      username: email.split('@')[0],
      bio: '这个人很懒，什么都没写',
      location: '未知',
      avatar: 'https://via.placeholder.com/100',
      coverPhoto: '',
      连续打卡: 0,
      掌握单词: 0,
      学习天数: 0,
      成就: []
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // 自动登录
    currentUser = newUser;
    isLoggedIn = true;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    updateLoginStatus();
    document.getElementById('loginModal').classList.remove('show');
    alert('注册成功！');
  }
}

// 加载用户信息
function loadUser() {
  if (auth) {
    // 监听用户登录状态变化
    auth.onAuthStateChanged((user) => {
      if (user) {
        // 用户已登录
        firebaseUser = user;
        loadUserData();
      } else {
        // 用户已退出
        currentUser = null;
        isLoggedIn = false;
        updateLoginStatus();
      }
    });
  } else {
    // Firebase 未初始化，使用本地存储
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      isLoggedIn = true;
      updateLoginStatus();
    }
  }
}

// 从Firestore加载用户数据
function loadUserData() {
  if (firebaseUser && db) {
    db.collection('users').doc(firebaseUser.uid).get()
      .then((doc) => {
        if (doc.exists) {
          currentUser = doc.data();
          isLoggedIn = true;
          updateLoginStatus();
          // 加载用户单词数据
          loadUserWords();
        } else {
          // 用户资料不存在，创建默认资料
          const newUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            nickname: firebaseUser.email.split('@')[0],
            username: firebaseUser.email.split('@')[0],
            bio: '这个人很懒，什么都没写',
            location: '未知',
            avatar: 'https://via.placeholder.com/100',
            coverPhoto: '',
            连续打卡: 0,
            掌握单词: 0,
            学习天数: 0,
            成就: []
          };
          db.collection('users').doc(firebaseUser.uid).set(newUser)
            .then(() => {
              currentUser = newUser;
              isLoggedIn = true;
              updateLoginStatus();
            })
            .catch((error) => {
              console.error('创建用户资料失败：', error);
            });
        }
      })
      .catch((error) => {
        console.error('加载用户数据失败：', error);
      });
  }
}

// 保存用户信息
function saveUser() {
  if (currentUser && firebaseUser && db) {
    db.collection('users').doc(firebaseUser.uid).set(currentUser)
      .then(() => {
        console.log('用户资料保存成功');
      })
      .catch((error) => {
        console.error('保存用户资料失败：', error);
      });
  } else if (currentUser) {
    // Firebase 未初始化，使用本地存储
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      users[index] = currentUser;
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else if (sessionStorage.getItem('currentUser')) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }
}

// 加载用户单词数据
function loadUserWords() {
  if (firebaseUser && db) {
    db.collection('words').where('userId', '==', firebaseUser.uid).get()
      .then((querySnapshot) => {
        words = [];
        books = new Set(['默认词书']);
        querySnapshot.forEach((doc) => {
          const word = doc.data();
          words.push(word);
          books.add(word.book);
        });
        books = Array.from(books);
        initBookSelection();
        shuffleWords();
        updateWordList();
      })
      .catch((error) => {
        console.error('加载单词数据失败：', error);
      });
  }
}

// 保存用户单词数据
function saveWords() {
  if (firebaseUser && db) {
    // 先删除用户所有单词
    db.collection('words').where('userId', '==', firebaseUser.uid).get()
      .then((querySnapshot) => {
        const batch = db.batch();
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        return batch.commit();
      })
      .then(() => {
        // 再添加所有单词
        const batch = db.batch();
        words.forEach((word) => {
          const wordRef = db.collection('words').doc();
          batch.set(wordRef, { ...word, userId: firebaseUser.uid });
        });
        return batch.commit();
      })
      .then(() => {
        console.log('单词数据保存成功');
      })
      .catch((error) => {
        console.error('保存单词数据失败：', error);
        // 保存失败时使用本地存储
        localStorage.setItem('koreanWords', JSON.stringify(words));
        localStorage.setItem('koreanBooks', JSON.stringify(books));
      });
  } else {
    // 未登录或 Firebase 未初始化时使用本地存储
    localStorage.setItem('koreanWords', JSON.stringify(words));
    localStorage.setItem('koreanBooks', JSON.stringify(books));
  }
}

// 更新登录状态
function updateLoginStatus() {
  const loginBtn = document.getElementById('loginBtn');
  if (isLoggedIn && currentUser) {
    loginBtn.textContent = '退出';
    loginBtn.onclick = function() {
      logout();
    };
  } else {
    loginBtn.textContent = '登录';
    loginBtn.onclick = function() {
      document.getElementById('loginModal').classList.add('show');
    };
  }
}

// 退出登录
function logout() {
  if (confirm('确定要退出登录吗？')) {
    if (auth) {
      auth.signOut()
        .then(() => {
          currentUser = null;
          isLoggedIn = false;
          updateLoginStatus();
          alert('已退出登录！');
        })
        .catch((error) => {
          alert('退出登录失败：' + error.message);
        });
    } else {
      // Firebase 未初始化，使用本地存储
      currentUser = null;
      isLoggedIn = false;
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
      updateLoginStatus();
      alert('已退出登录！');
    }
  }
}

// 初始化个人主页
function initProfilePage() {
  updateProfileInfo();
  initCalendar();
  initAchievements();
  initActivityList();
}

// 初始化资料编辑页面
function initEditProfilePage() {
  if (currentUser) {
    document.getElementById('editAvatar').src = currentUser.avatar || 'https://via.placeholder.com/100';
    document.getElementById('editNickname').value = currentUser.nickname || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editLocation').value = currentUser.location || '';
    
    if (currentUser.coverPhoto) {
      document.getElementById('editCoverPhoto').style.backgroundImage = `url(${currentUser.coverPhoto})`;
    } else {
      document.getElementById('editCoverPhoto').style.backgroundImage = '';
    }
  }
}

// 保存资料
function saveProfile() {
  if (currentUser) {
    currentUser.avatar = document.getElementById('editAvatar').src;
    currentUser.nickname = document.getElementById('editNickname').value;
    currentUser.bio = document.getElementById('editBio').value;
    currentUser.location = document.getElementById('editLocation').value;
    
    const coverStyle = document.getElementById('editCoverPhoto').style.backgroundImage;
    if (coverStyle) {
      currentUser.coverPhoto = coverStyle.replace('url("', '').replace('")', '');
    } else {
      currentUser.coverPhoto = '';
    }
    
    saveUser();
    updateProfileInfo();
    showPage('profile');
    alert('资料保存成功！');
  }
}

// 更新个人信息
function updateProfileInfo() {
  if (isLoggedIn && currentUser) {
    document.getElementById('nickname').textContent = currentUser.nickname;
    document.getElementById('username').textContent = `@${currentUser.username}`;
    document.getElementById('bio').textContent = currentUser.bio;
    document.getElementById('location').textContent = currentUser.location;
    document.getElementById('avatar').src = currentUser.avatar;
    
    if (currentUser.coverPhoto) {
      document.getElementById('coverPhoto').style.backgroundImage = `url(${currentUser.coverPhoto})`;
    }
    
    // 更新统计数据
    document.querySelectorAll('.stat-number')[0].textContent = currentUser.连续打卡 || 0;
    document.querySelectorAll('.stat-number')[1].textContent = currentUser.掌握单词 || 0;
    document.querySelectorAll('.stat-number')[2].textContent = currentUser.学习天数 || 0;
  } else {
    document.getElementById('nickname').textContent = '未登录';
    document.getElementById('username').textContent = '@guest';
    document.getElementById('bio').textContent = '请登录以查看个人信息';
    document.getElementById('location').textContent = '未知';
    document.getElementById('avatar').src = 'https://via.placeholder.com/100';
    document.getElementById('coverPhoto').style.backgroundImage = '';
    
    // 重置统计数据
    document.querySelectorAll('.stat-number').forEach(elem => elem.textContent = '0');
  }
}

// 编辑个人资料
function editProfile() {
  if (!isLoggedIn) {
    alert('请先登录！');
    return;
  }
  
  const nickname = prompt('请输入昵称：', currentUser.nickname);
  const bio = prompt('请输入个性签名：', currentUser.bio);
  const location = prompt('请输入地区：', currentUser.location);
  
  if (nickname) currentUser.nickname = nickname;
  if (bio) currentUser.bio = bio;
  if (location) currentUser.location = location;
  
  saveUser();
  updateProfileInfo();
  alert('个人资料更新成功！');
}

// 初始化日历
function initCalendar() {
  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';
  
  // 生成当月日历
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // 添加星期标题
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  weekdays.forEach(day => {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    calendar.appendChild(dayElement);
  });
  
  // 添加空白日期
  for (let i = 0; i < firstDayOfMonth; i++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day empty';
    calendar.appendChild(dayElement);
  }
  
  // 添加日期
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    // 随机标记一些日期为已打卡（实际项目中应该从用户数据中获取）
    if (Math.random() > 0.7) {
      dayElement.classList.add('checked');
    }
    
    calendar.appendChild(dayElement);
  }
}

// 初始化成就系统
function initAchievements() {
  const achievements = document.getElementById('achievements');
  achievements.innerHTML = '';
  
  const achievementData = [
    { icon: '📚', name: '开始学习' },
    { icon: '🔥', name: '连续打卡7天' },
    { icon: '💯', name: '掌握100词' },
    { icon: '🌟', name: '学习达人' },
    { icon: '🏆', name: '词汇王者' }
  ];
  
  achievementData.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement-item';
    achievementElement.innerHTML = `
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-name">${achievement.name}</div>
    `;
    achievements.appendChild(achievementElement);
  });
}

// 初始化活动列表
function initActivityList() {
  const activityList = document.getElementById('activityList');
  activityList.innerHTML = '';
  
  const activities = [
    { content: '学习了10个新单词', date: '今天' },
    { content: '完成了第一单元的学习', date: '昨天' },
    { content: '连续打卡3天', date: '3天前' }
  ];
  
  activities.forEach(activity => {
    const activityElement = document.createElement('div');
    activityElement.className = 'activity-item';
    activityElement.innerHTML = `
      <div class="activity-content">${activity.content}</div>
      <div class="activity-date">${activity.date}</div>
    `;
    activityList.appendChild(activityElement);
  });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);