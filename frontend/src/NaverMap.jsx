// NaverMap.jsx
import { useEffect, useRef, useState } from 'react';
import drowsy_driving_icon from './assets/drowsy_driving_icon.png';

function NaverMap({ isMapVisible }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null); // 초기값 제거
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false); // 스크립트 로드 여부 추가

  useEffect(() => {
    // 네이버 지도 API 스크립트가 로드되어 있는지 확인
    const loadMapScript = () => {
      if (!window.naver) {
        const script = document.createElement('script');
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${import.meta.env.VITE_NAVER_CLIENT_ID}`;
        script.async = true;
        script.onload = () => setIsMapScriptLoaded(true);
        document.head.appendChild(script);
      } else {
        setIsMapScriptLoaded(true);
      }
    };

    loadMapScript();
  }, []);

  useEffect(() => {
    if (isMapScriptLoaded) {
      // 위치 요청 성공 시 위치를 업데이트
      const success = (location) => {
        const newLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        setCurrentLocation(newLocation);
        initializeMap(newLocation); // 위치 성공 시 지도 초기화
      };

      // 위치 요청 실패 시 기본 좌표 사용 (서울시청)
      const error = () => {
        const defaultLocation = { lat: 37.5666103, lng: 126.9783882 };
        setCurrentLocation(defaultLocation);
        initializeMap(defaultLocation); // 위치 실패 시 기본 좌표로 지도 초기화
      };

      // 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      }
    }
  }, [isMapScriptLoaded]); // 스크립트 로드 여부에 따라 위치 설정 실행

  const initializeMap = (location) => {
    if (window.naver && window.naver.maps) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(location.lat, location.lng),
        zoom: 15,
      };
      const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // 현재 위치에 마커 생성 (아이콘 사용)
      const locationMarker = new window.naver.maps.Marker({
        map: newMap,
        position: mapOptions.center,
        icon: {
          content: `<div style="width:50px;height:50px;background:url(${drowsy_driving_icon}) no-repeat center/contain;"></div>`,
          anchor: new window.naver.maps.Point(20, 20),
        },
      });
      setMarker(locationMarker);
    }
  };

  useEffect(() => {
    if (map && marker && currentLocation) {
      // 현재 위치 변경 시 지도 중심과 마커 위치를 업데이트
      const newPosition = new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng);
      map.setCenter(newPosition);
      marker.setPosition(newPosition);
    }
  }, [currentLocation, map, marker]);

  if (!isMapVisible) return null;

  return (
    <div style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '10px', marginLeft: '20px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}

export default NaverMap;
