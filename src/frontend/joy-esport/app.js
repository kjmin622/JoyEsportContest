const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',  // 기본적으로 1일 동안 캐시 (필요한 경우에만)
  setHeaders: (res, path) => {
    // 이미지 파일 및 폰트 파일에만 캐시 설정
    if (path.endsWith('.ttf') || path.endsWith('.png')) {
      res.setHeader('Cache-Control', 'public, max-age=86400');  // 86400초 = 1일
    }

    // HTML, CSS, JS 파일은 캐시하지 않음
    if (path.endsWith('.html') || path.endsWith('.css') || path.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

// "/" 경로에서 index.html 반환
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// "/login" 경로에서 login.html 반환
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.get('/guitar_game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'guitar_game.html'));
});

app.get('/racing_game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'racing_game.html'));
});

app.get('/safe_game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'safe_game.html'));
});

app.get('/ranking', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ranking.html'));
});

// 다른 모든 경로에 대한 처리 (필요에 따라 추가)
app.get('*', (req, res) => {
  res.status(404).send('Page Not Found');
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
