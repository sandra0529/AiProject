import { useState } from 'react';
import Video from './Video.jsx';
import NaverMap from './NaverMap.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import './App.css';

function App() {
  const [drowsyDetected, setDrowsyDetected] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false); // 초기값 false로 설정
  const [playMode, setPlayMode] = useState('alarm');
  const [volumeLevel, setVolumeLevel] = useState(0.5);
  const [popupMessage, setPopupMessage] = useState(''); // popupMessage 상태 추가

  // 홈버튼 클릭 시 초기화 함수
  const onHomeClick = () => {
    setIsVideoVisible(false);
    setPlayMode('alarm');
    setVolumeLevel(0.5);
    setDrowsyDetected(false);
    setPopupMessage('');
  };

  const toggleVideoVisibility = () => {
    setIsVideoVisible(!isVideoVisible);
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <NaverMap drowsyDetected={drowsyDetected} />

      <Video
        setDrowsyDetected={setDrowsyDetected}
        isVisible={isVideoVisible}
        playMode={playMode}
        volumeLevel={volumeLevel}
        setPopupMessage={setPopupMessage} // setPopupMessage 전달
      />

      {popupMessage && (
        <div className="mapPopupMessage">
          {popupMessage}
        </div>
      )}

      <LeftSidebar
        onHomeClick={onHomeClick}
        isVideoVisible={isVideoVisible}
        toggleVideoVisibility={toggleVideoVisibility}
        playMode={playMode}
        setPlayMode={setPlayMode}
        volumeLevel={volumeLevel}
        setVolumeLevel={setVolumeLevel}
      />
    </div>
  );
}

export default App;
