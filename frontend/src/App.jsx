import { useState, useEffect, useRef } from 'react';  
import alertSound from './assets/red-alert_nuclear_buzzer-99741.mp3';
import emergencyVoiceAlertSound from './assets/emergency_voice_alert.m4a';
import suspicionVoiceAlertSound from './assets/suspicion_voice_alert.m4a';

function App() {
  const videoFeedUrl = 'http://192.168.0.224:8000/video_feed'; // FastAPI URL
  const placeholderImg = 'https://via.placeholder.com/800x600/000000/FFFFFF?text=Sleep+Zero';
  const [imgSrc, setImgSrc] = useState(placeholderImg);
  const [size, setSize] = useState(50);
  const [alarmVolume, setAlarmVolume] = useState(0.5);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const [popupMessage, setPopupMessage] = useState("");
  const [isVisible, setIsVisible] = useState(true); // 화면 표시 상태
  const [isRunning, setIsRunning] = useState(false); // 시작/종료 버튼 상태
  const [isAlertActive, setIsAlertActive] = useState(false); // 경고 중 상태

  const alarmAudioRef = useRef(new Audio(alertSound));
  const emergencyVoiceAudioRef = useRef(new Audio(emergencyVoiceAlertSound));
  const suspicionVoiceAudioRef = useRef(new Audio(suspicionVoiceAlertSound));

  const handleAlarmVolumeChange = (event) => {
    setAlarmVolume(event.target.value);
    alarmAudioRef.current.volume = event.target.value;
  };

  const handleVoiceVolumeChange = (event) => {
    setVoiceVolume(event.target.value);
    emergencyVoiceAudioRef.current.volume = event.target.value;
    suspicionVoiceAudioRef.current.volume = event.target.value;
  };

  const handleStart = () => {
    setImgSrc(videoFeedUrl);
    setIsRunning(true); // 시작 상태로 설정
  };

  const handleStop = () => {
    setImgSrc(placeholderImg);
    setIsRunning(false); // 종료 상태로 설정
    setPopupMessage(""); // 종료 시 안내 메시지 제거
  };

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        if (isAlertActive) return; // 경고 중이면 새 예측 무시

        fetch('http://192.168.0.244:8000/prediction')
          .then((response) => response.json())
          .then((jsonData) => {
            console.log("Full response:", jsonData);  // 전체 응답 확인
            const prediction = jsonData.prediction;  // 예상 JSON 구조에 따라 수정
            console.log("Prediction:", prediction);
            
            if (prediction === 0) {
              setPopupMessage("졸음운전 중입니다. 환기를 하십시오.");
              setIsAlertActive(true); // 경고 활성화
              alarmAudioRef.current.play();
              alarmAudioRef.current.onended = () => {
                emergencyVoiceAudioRef.current.volume = voiceVolume;
                emergencyVoiceAudioRef.current.play();
                emergencyVoiceAudioRef.current.onended = () => {
                  setPopupMessage("");
                  setIsAlertActive(false); // 경고 완료 후 해제
                };
              };
            } else if (prediction === 1) {
              setPopupMessage("졸음운전이 의심됩니다. 주의하세요");
              setIsAlertActive(true); // 경고 활성화
              alarmAudioRef.current.play();
              alarmAudioRef.current.onended = () => {
                suspicionVoiceAudioRef.current.volume = voiceVolume;
                suspicionVoiceAudioRef.current.play();
                suspicionVoiceAudioRef.current.onended = () => {
                  setPopupMessage("");
                  setIsAlertActive(false); // 경고 완료 후 해제
                };
              };
            }
          })
          .catch((error) => console.error("Error fetching data:", error));
      }, 1000); // 백엔드와의 속도 차이 최소화를 위해 1초마다 요청
      
      return () => clearInterval(interval);
    }
  }, [isRunning, voiceVolume, isAlertActive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
      {/* 이미지와 화면 크기 조절 슬라이더를 isVisible 상태에 따라 표시 */}
      {isVisible && (
        <>
          <img
            src={imgSrc}
            alt="Video Stream"
            onError={() => setImgSrc(placeholderImg)}
            style={{ width: `${size}%`, height: 'auto' }}
          />
          <input
            type="range"
            min="10"
            max="100"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            style={{ marginTop: '20px', width: '50%' }}
          />
        </>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button onClick={() => setIsVisible(!isVisible)} style={{ padding: '10px 20px' }}>
          {isVisible ? '화면 숨기기' : '화면 보기'}
        </button>

        <button 
          onClick={handleStart} 
          disabled={isRunning} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: isRunning ? 'gray' : 'green', 
            color: 'white',
            cursor: isRunning ? 'not-allowed' : 'auto'
          }}>
          시작
        </button>

        <button 
          onClick={handleStop} 
          disabled={!isRunning} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: !isRunning ? 'gray' : 'green', 
            color: 'white',
            cursor: !isRunning ? 'not-allowed' : 'auto'
          }}>
          종료
        </button>
      </div>

      {popupMessage && (
        <div style={{ position: 'fixed', top: '20%', padding: '20px', backgroundColor: 'rgba(255, 0, 0, 0.8)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', zIndex: 1000 }}>
          {popupMessage}
        </div>
      )}

      {/* 안내음성 및 경고음 크기 조절 슬라이더 */}
      <div style={{ marginTop: '20px', width: '60%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span role="img" aria-label="Muted Bell">🔕</span>
          <span>안내음성 크기</span>
          <span role="img" aria-label="Bell">🔔</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={voiceVolume}
          onChange={handleVoiceVolumeChange}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '20px', width: '60%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span role="img" aria-label="Muted Bell">🔕</span>
          <span>경고음 크기</span>
          <span role="img" aria-label="Bell">🔔</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={alarmVolume}
          onChange={handleAlarmVolumeChange}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}

export default App;
