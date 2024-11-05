import React from 'react';

function App() {
  const videoFeedUrl = 'http://192.168.0.196:8000/video_feed'; // FastAPI 서버 주소

  return (
    <div>
      <img src={videoFeedUrl} alt="Video Stream" style={{ width: '100%', height: '100vh', objectFit: 'cover' }} />
      <p>깃허브 호스팅 테스트</p>    
    </div>
  );
}

export default App;
