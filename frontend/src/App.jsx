import {useState} from 'react';

function App() {
  const videoFeedUrl = 'http://192.168.0.229:8000/video_feed';
  const [imgSrc, setImgSrc] = useState(videoFeedUrl); // 기본 이미지 소스를 비디오 피드로 설정
  const [size, setSize] = useState(50); // 초기 크기 설정

  // 슬라이더 조절 시 크기 업데이트
  const handleSizeChange = (event) => {
    setSize(event.target.value);
  };

  // 비디오 피드가 로드되지 않을 때 대체 이미지 설정
  const handleImageError = () => {
    // 대체 이미지를 즉시 설정
    setImgSrc('https://via.placeholder.com/800x600/000000/FFFFFF?text=No+Video');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
    }}>
      <img
        src={imgSrc}
        alt="Video Stream"
        onError={handleImageError} // 비디오 피드 로드 실패 시 대체 이미지로 변경
        style={{
          width: `${size}%`,
          height: 'auto',
        }}
      />
      <input
        type="range"
        min="10"
        max="100"
        value={size}
        onChange={handleSizeChange}
        style={{
          marginTop: '20px',
          width: '50%',
        }}
      />
    </div>
  );
}

export default App;