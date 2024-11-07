import { useState, useRef } from 'react';
import alertSound from './assets/red-alert_nuclear_buzzer-99741.mp3';
import emergencyVoiceAlertSound from './assets/emergency_voice_alert.m4a';
import suspicionVoiceAlertSound from './assets/suspicion_voice_alert.m4a';

function App() {
  const videoFeedUrl = 'http://192.168.0.229:8000/video_feed'; // FastAPI URL 주석 처리
  const placeholderImg = 'https://via.placeholder.com/800x600/000000/FFFFFF?text=Sleep+Zero';
  const runningImg = 'https://via.placeholder.com/800x600/000000/FFFFFF?text=Video+Running';
  const [imgSrc, setImgSrc] = useState(placeholderImg);
  const [size, setSize] = useState(50);
  const [alarmVolume, setAlarmVolume] = useState(0.5);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const [showButtons, setShowButtons] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

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

  const handleEmergencyAlert = () => {
    setPopupMessage("졸음운전 중입니다. 환기를 하십시오.");
    alarmAudioRef.current.play();
    alarmAudioRef.current.onended = () => {
      emergencyVoiceAudioRef.current.volume = voiceVolume;
      emergencyVoiceAudioRef.current.play();
    };
  };

  const handleSuspicionAlert = () => {
    setPopupMessage("졸음운전이 의심됩니다. 주의하세요");
    alarmAudioRef.current.play();
    alarmAudioRef.current.onended = () => {
      suspicionVoiceAudioRef.current.volume = voiceVolume;
      suspicionVoiceAudioRef.current.play();
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
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
      <div>
        <button onClick={() => setImgSrc(runningImg) || setShowButtons(true)} style={{ marginTop: '20px', padding: '10px 20px' }}>
          시작
        </button>
        <button onClick={() => setImgSrc(placeholderImg) || setShowButtons(false)} style={{ marginTop: '20px', padding: '10px 20px' }}>
          종료
        </button>
      </div>

      {showButtons && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={handleEmergencyAlert} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white' }}>
            졸음운전 긴급
          </button>
          <button onClick={handleSuspicionAlert} style={{ padding: '10px 20px', backgroundColor: 'orange', color: 'white' }}>
            졸음운전 의심
          </button>
        </div>
      )}

      {popupMessage && (
        <div style={{ position: 'fixed', top: '20%', padding: '20px', backgroundColor: 'rgba(255, 0, 0, 0.8)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', zIndex: 1000 }}>
          {popupMessage}
        </div>
      )}

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
