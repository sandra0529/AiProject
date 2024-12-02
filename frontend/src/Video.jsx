// Video.jsx
import { useState, useEffect, useRef } from 'react';
import alertSound from './assets/red-alert_nuclear_buzzer-99741.mp3';
import emergencyVoiceAlertSound from './assets/emergency_voice_alert.m4a';
import suspicionVoiceAlertSound from './assets/suspicion_voice_alert.m4a';
import songSample from './assets/sample_song.mp3';
import place_holder from './assets/place_holder.webp';
import './Video.css';

function Video({ setDrowsyDetected }) {
  const [size, setSize] = useState(50);
  const [alarmVolume, setAlarmVolume] = useState(0.5);
  const [voiceVolume, setVoiceVolume] = useState(0.5);
  const [popupMessage, setPopupMessage] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isAlertActive, setIsAlertActive] = useState(false);
  const [playMode, setPlayMode] = useState('alarm');

  const alarmAudioRef = useRef(new Audio(alertSound));
  const emergencyVoiceAudioRef = useRef(new Audio(emergencyVoiceAlertSound));
  const suspicionVoiceAudioRef = useRef(new Audio(suspicionVoiceAlertSound));
  const songAudioRef = useRef(new Audio(songSample));
  const videoRef = useRef(null);

  // 볼륨 조절 함수
  const handleAlarmVolumeChange = (event) => {
    setAlarmVolume(event.target.value);
    alarmAudioRef.current.volume = event.target.value;
    songAudioRef.current.volume = event.target.value;
  };

  const handleVoiceVolumeChange = (event) => {
    setVoiceVolume(event.target.value);
    emergencyVoiceAudioRef.current.volume = event.target.value;
    suspicionVoiceAudioRef.current.volume = event.target.value;
  };

  // 시작/종료 토글 함수
  const toggleRunning = () => {
    if (isRunning) {
      setPopupMessage('');
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

  // 모의 신호 생성 함수 (테스트용)
  const generateMockSignal = () => {
    const signals = [0, 1, 2];
    return signals[Math.floor(Math.random() * signals.length)];
  };

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        if (isAlertActive) return;

        const classification = generateMockSignal();
        console.log("Mock Signal Value:", classification);

        if (classification === 0) {
          console.log('정상 상태: 운전자 이상 행동이 없습니다.');
          setPopupMessage('');
          setDrowsyDetected(false); // 졸음운전 감지 해제
        } else if (classification === 1) {
          console.log('졸음운전 중입니다. 환기를 하십시오.');
          setPopupMessage('졸음운전 중입니다. 환기를 하십시오.');
          setIsAlertActive(true);
          setDrowsyDetected(true); // 졸음운전 감지
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
          setDrowsyDetected(true); // 졸음운전 의심 감지
          playAlert(() => {
            suspicionVoiceAudioRef.current.volume = voiceVolume;
            suspicionVoiceAudioRef.current.play();
            suspicionVoiceAudioRef.current.onended = () => {
              setPopupMessage('');
              setIsAlertActive(false);
            };
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, voiceVolume, isAlertActive, setDrowsyDetected]);

  // 알림 재생 함수
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
    <div className="floatingWindow">
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
              src={place_holder}
              alt="Placeholder"
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
  );
}

export default Video;
