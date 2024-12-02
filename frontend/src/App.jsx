// App.jsx
import { useState } from 'react';
import Video from './Video.jsx';
import NaverMap from './NaverMap.jsx';
import './App.css'; // 빈 파일

function App() {
  const [drowsyDetected, setDrowsyDetected] = useState(false);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* 졸음운전 감지 상태를 NaverMap에 전달 */}
      <NaverMap drowsyDetected={drowsyDetected} />

      {/* Video 컴포넌트에 setDrowsyDetected 함수 전달 */}
      <Video setDrowsyDetected={setDrowsyDetected} />
    </div>
  );
}

export default App;
