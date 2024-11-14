// NaverMap.jsx
import { useEffect, useRef } from 'react';

function NaverMap({ isMapVisible }) {
  const mapRef = useRef(null);

  useEffect(() => {
    const initializeMap = () => {
      if (window.naver && mapRef.current) {
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 좌표 예시
          zoom: 10,
        };
        new window.naver.maps.Map(mapRef.current, mapOptions);
      }
    };

    const loadNaverMapScript = () => {
      if (!window.naver) {
        const script = document.createElement('script');
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${import.meta.env.VITE_NAVER_CLIENT_ID}`;
        script.async = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    if (isMapVisible) {
      loadNaverMapScript();
    }
  }, [isMapVisible]);

  if (!isMapVisible) return null; // 지도 표시 상태가 false일 경우 null 반환

  return (
    <div style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '10px', marginLeft: '20px'}}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}

export default NaverMap;
