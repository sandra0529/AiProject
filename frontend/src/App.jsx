import { useState, useEffect, useRef } from 'react';
import alertSound from './assets/red-alert_nuclear_buzzer-99741.mp3';
import emergencyVoiceAlertSound from './assets/emergency_voice_alert.m4a';
import suspicionVoiceAlertSound from './assets/suspicion_voice_alert.m4a';
import songSample from './assets/sample_song.mp3'; // 사용자 노래 추가용 샘플 파일
import place_holder from './assets/place_holder.webp';
import NaverMap from './NaverMap.jsx';
import './App.css';

function App() {
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
  const videoRef = useRef(null); // 비디오 요소 참조
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
      setPopupMessage('');
      setShowMap(false);
      stopWebcam();
    } else {
      startWebcam();
    }
    setIsRunning(!isRunning);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam(); // 컴포넌트 언마운트 시 웹캠 스트림 종료
    };
  }, []);

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
    <div className="container">
      <div className={showMap ? "leftPaneWithMap" : "leftPane"}>
        {isVisible && (
          <div className="imageWrapper" style={{ width: `${size}%` }}>
            {isRunning ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="videoImage"
              ></video>
            ) : (
              <img
                ref={imageRef}
                src={imgSrc}
                alt="Video Stream"
                className="videoImage"
              />
            )}
            {popupMessage && (
              <div className="popupMessage">
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
          className="rangeInput"
        />

        <div className="buttonGroup">
          <button onClick={() => setIsVisible(!isVisible)} className="actionButton">
            {isVisible ? '화면 숨기기' : '화면 표시'}
          </button>

          <button onClick={toggleRunning} className="toggleButton">
            {isRunning ? '종료' : '시작'}
          </button>
        </div>

        <div className="radioGroup">
          <label>
            <input
              type="radio"
              value="alarm"
              checked={playMode === 'alarm'}
              onChange={() => setPlayMode('alarm')}
            />
            경고음 재생
          </label>
          <label>
            <input
              type="radio"
              value="song"
              checked={playMode === 'song'}
              onChange={() => setPlayMode('song')}
            />
            노래 재생
          </label>
        </div>

        <div className="volumeControl">
          <div className="volumeHeader">
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
            className="volumeInput"
            style={{
              background: `linear-gradient(to right, #A3D9A5 ${voiceVolume * 100}%, #e0e0e0 ${voiceVolume * 100}%)`,
            }}
          />
        </div>
        <div className="volumeControl">
          <div className="volumeHeader">
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
            className="volumeInput"
            style={{
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
