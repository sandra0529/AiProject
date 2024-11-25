import { useState, useEffect, useRef } from 'react';
import alertSound from './assets/red-alert_nuclear_buzzer-99741.mp3';
import emergencyVoiceAlertSound from './assets/emergency_voice_alert.m4a';
import suspicionVoiceAlertSound from './assets/suspicion_voice_alert.m4a';
import songSample from './assets/sample_song.mp3'; // 사용자 노래 추가용 샘플 파일
import place_holder from './assets/place_holder.webp';
import NaverMap from './NaverMap.jsx';

function App() {
  const videoFeedUrl = 'http://192.168.0.5:8000/video_feed';
  const videoPredictionUrl = 'http://192.168.0.5:8000/prediction';
  const placeholderImg = place_holder;
  const [imgSrc, setImgSrc] = useState(placeholderImg);
  const [size, setSize] = useState(50);
  const [alarmVolume, setAlarmVolume] = useState(0.5);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const [popupMessage, setPopupMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [playMode, setPlayMode] = useState('alarm'); // 추가: 경고음(alarm) 또는 노래(song) 선택

  const alarmAudioRef = useRef(new Audio(alertSound));
  const emergencyVoiceAudioRef = useRef(new Audio(emergencyVoiceAlertSound));
  const suspicionVoiceAudioRef = useRef(new Audio(suspicionVoiceAlertSound));
  const songAudioRef = useRef(new Audio(songSample)); // 추가: 노래 재생용 Ref
  const imageRef = useRef(null);

  const handleAlarmVolumeChange = (event) => {
    setAlarmVolume(event.target.value);
    alarmAudioRef.current.volume = event.target.value;
    songAudioRef.current.volume = event.target.value; // 노래 볼륨도 동일하게 적용
  };

  const handleVoiceVolumeChange = (event) => {
    setVoiceVolume(event.target.value);
    emergencyVoiceAudioRef.current.volume = event.target.value;
    suspicionVoiceAudioRef.current.volume = event.target.value;
  };

  const toggleRunning = () => {
    if (isRunning) {
      setImgSrc(placeholderImg);
      setPopupMessage('');
      setShowMap(false);
    } else {
      setImgSrc(videoFeedUrl);
    }
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        if (isAlertActive) return;
  
        fetch(videoPredictionUrl)
          .then((response) => response.json())
          .then((jsonData) => {
            const classification = jsonData.classification;
            console.log("Prediction Value:", classification);
  
            if(classification === 0) {
              console.log('정상 상태: 운전자 이상 행동이 없습니다.');
              setPopupMessage('');
            } else if(classification === 1) {
              console.log('졸음운전 중입니다. 환기를 하십시오.');
              setPopupMessage('졸음운전 중입니다. 환기를 하십시오.');
              setIsAlertActive(true);
              setShowMap(true);
              playAlert(() => {
                emergencyVoiceAudioRef.current.volume = voiceVolume;
                emergencyVoiceAudioRef.current.play();
                emergencyVoiceAudioRef.current.onended = () => {
                  setPopupMessage('');
                  setIsAlertActive(false);
                };
              });
            } else if (classification === 2) {
              console.log('졸음운전이 의심됩니다. 주의하세요.');
              setPopupMessage('졸음운전 의심됩니다. 주의하세요.');
              setIsAlertActive(true);
              setShowMap(true);
              playAlert(() => {
                suspicionVoiceAudioRef.current.volume = voiceVolume;
                suspicionVoiceAudioRef.current.play();
                suspicionVoiceAudioRef.current.onended = () => {
                  setPopupMessage('');
                  setIsAlertActive(false);
                };
              });
            }
          })
          .catch((error) => {
            console.error("Prediction Fetch Error:", error);
          });
      }, 1000);
  
      return () => clearInterval(interval);
    }
  }, [isRunning, voiceVolume, isAlertActive]);
  


  // 추가: 알림(경고음 또는 노래) 재생 함수
  const playAlert = (onEndCallback) => {
    if (playMode === 'alarm') {
      alarmAudioRef.current.play();
      alarmAudioRef.current.onended = onEndCallback;
    } else if (playMode === 'song') {
      songAudioRef.current.play();
      songAudioRef.current.onended = onEndCallback;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <div style={{ flex: showMap ? 0.5 : 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {isVisible && (
          <div style={{ position: 'relative', width: `${size}%` }}>
            <img
              ref={imageRef}
              src={imgSrc}
              alt="Video Stream"
              onError={() => setImgSrc(placeholderImg)}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
            {popupMessage && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '300px',
                  height: '50px',
                  padding: '10px',
                  backgroundColor: 'rgba(255, 0, 0, 0.8)',
                  color: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  zIndex: 1000,
                }}
              >
                {popupMessage}
              </div>
            )}
          </div>
        )}

        <input
          type="range"
          min="10"
          max="100"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          style={{ marginTop: '20px', width: '50%' }}
        />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => setIsVisible(!isVisible)} style={{ padding: '10px 20px' }}>
            {isVisible ? '화면 숨기기' : '화면 표시'}
          </button>

          <button
            onClick={toggleRunning}
            style={{
              padding: '10px 20px',
              backgroundColor: 'green',
              color: 'white',
            }}
          >
            {isRunning ? '종료' : '시작'}
          </button>
        </div>

        {/* 추가: 경고음/노래 옵션 선택 */}
        <div style={{ marginTop: '20px', width: '60%' }}>
          <label>
            <input
              type="radio"
              value="alarm"
              checked={playMode === 'alarm'}
              onChange={() => setPlayMode('alarm')}
            />
            경고음 재생
          </label>
          <label style={{ marginLeft: '20px' }}>
            <input
              type="radio"
              value="song"
              checked={playMode === 'song'}
              onChange={() => setPlayMode('song')}
            />
            노래 재생
          </label>
        </div>

        <div style={{ marginTop: '20px', width: '60%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span role="img" aria-label="Muted Bell">
              🔕
            </span>
            <span>안내음성 크기</span>
            <span role="img" aria-label="Bell">
              🔔
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={voiceVolume}
            onChange={handleVoiceVolumeChange}
            style={{
              width: '100%',
              WebkitAppearance: 'none',
              height: '6px',
              borderRadius: '5px',
              background: `linear-gradient(to right, #A3D9A5 ${voiceVolume * 100}%, #e0e0e0 ${voiceVolume * 100}%)`,
            }}
          />
        </div>

        <div style={{ marginTop: '20px', width: '60%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span role="img" aria-label="Muted Bell">
              🔕
            </span>
            <span>경고음 크기</span>
            <span role="img" aria-label="Bell">
              🔔
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={alarmVolume}
            onChange={handleAlarmVolumeChange}
            style={{
              width: '100%',
              WebkitAppearance: 'none',
              height: '6px',
              borderRadius: '5px',
              background: `linear-gradient(to right, #F28B82 ${alarmVolume * 100}%, #e0e0e0 ${alarmVolume * 100}%)`,
            }}
          />
        </div>
      </div>
      {showMap && <NaverMap isMapVisible={showMap} />}
    </div>
  );
}

export default App;
