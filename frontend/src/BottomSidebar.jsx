import React, { useState, useEffect } from 'react';
import './BottomSidebar.css';

function BottomSidebar() {
  const [currentAddress, setCurrentAddress] = useState('현재 위치를 찾는 중...');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const initMap = () => {
      navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Proxy 서버를 통해 Reverse Geocoding 요청
          fetch(`http://localhost:5000/reverse-geocode?lat=${lat}&lon=${lon}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.results && data.results.length > 0) {
                const region = data.results[0].region; // 시, 구, 동 정보
                const land = data.results[0].land || {}; // 도로명, 상세 주소 정보

                // 도로명 주소만 가져오도록 수정
                const roadAddress = land.name ? `${land.name}` : ''; // 도로명
                const buildingNumber = land.number1 ? `${land.number1}${land.number2 ? `-${land.number2}` : ''}` : ''; // 건물 번호

                setCurrentAddress(
                  `${region.area1.name} ${region.area2.name} ${region.area3.name} ${roadAddress} ${buildingNumber}`.trim()
                );
              } else {
                setCurrentAddress('주소를 찾을 수 없습니다.');
              }
            })
            .catch((err) => {
              setErrorMessage('주소 데이터를 불러오지 못했습니다.');
              console.error(err);
            });
        },
        (error) => {
          setErrorMessage('위치 정보를 가져올 수 없습니다.');
          console.error(error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        }
      );
    };

    initMap();
  }, []);

  return (
    <div className="bottomSidebar">
      {errorMessage || currentAddress}
    </div>
  );
}

export default BottomSidebar;
