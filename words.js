// 单词数据
let words = [
    { korean: '안녕하세요', chinese: '你好', pronunciation: 'an-nyeong-ha-se-yo', book: '默认词书' },
    { korean: '감사합니다', chinese: '谢谢', pronunciation: 'gam-sa-ham-ni-da', book: '默认词书' },
    { korean: '네', chinese: '是', pronunciation: 'ne', book: '默认词书' },
    { korean: '아니요', chinese: '不是', pronunciation: 'a-ni-yo', book: '默认词书' },
    { korean: '맛있어요', chinese: '好吃', pronunciation: 'mas-it-seo-yo', book: '默认词书' }
];

// 词书列表
let books = ['默认词书'];

// 保存单词到本地存储
function saveWords() {
    localStorage.setItem('koreanWords', JSON.stringify(words));
    localStorage.setItem('koreanBooks', JSON.stringify(books));
}

// 从本地存储加载单词
function loadWords() {
    const savedWords = localStorage.getItem('koreanWords');
    if (savedWords) {
        words = JSON.parse(savedWords);
    }
    
    const savedBooks = localStorage.getItem('koreanBooks');
    if (savedBooks) {
        books = JSON.parse(savedBooks);
    }
}

// 初始化时加载单词
loadWords();