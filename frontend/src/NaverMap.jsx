import { useEffect, useRef, useState } from 'react';
import drowsy_driving_icon from './assets/drowsy_driving_icon.png';

function NaverMap({ isMapVisible }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null); // 현재 표시할 URL 상태 추가

  const restStops = [
    { 
      name: '서부산휴게소', 
      lat: 35.157258, 
      lng: 128.948777, 
      url: 'https://map.naver.com/v5/search/%EC%84%9C%EB%B6%80%EC%82%B0%ED%9C%B4%EA%B2%8C%EC%86%8C'
    },
    { 
      name: '김해금관가야휴게소', 
      lat: 35.269933, 
      lng: 129.003134, 
      url: 'https://map.naver.com/v5/search/김해금관가야휴게소' 
    },
    { 
      name: '양산휴게소', 
      lat: 35.323172, 
      lng: 129.056867, 
      url: 'https://map.naver.com/v5/search/%EC%96%91%EC%82%B0%ED%9C%B4%EA%B2%8C%EC%86%8C' 
    },
    { 
      name: '장안휴게소(울산방향)', 
      lat: 35.381033, 
      lng: 129.248737, 
      url: 'https://map.naver.com/v5/search/%EC%9E%A5%EC%95%88%ED%9C%B4%EA%B2%8C%EC%86%8C' 
    },
  ];

  useEffect(() => {
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
    if (isMapScriptLoaded && !currentUrl) { // URL이 없는 경우 지도 초기화
      const success = (location) => {
        const currentLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        initializeMap(currentLocation);
      };

      const error = () => {
        const defaultLocation = { lat: 37.5666103, lng: 126.9783882 }; // 서울시청 기본 좌표
        initializeMap(defaultLocation);
      };

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
      } else {
        error();
      }
    }
  }, [isMapScriptLoaded, currentUrl]);

  const initializeMap = (currentLocation) => {
    if (window.naver && window.naver.maps) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
        zoom: 10,
      };
      const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      const bounds = new window.naver.maps.LatLngBounds();

      // 현재 위치 마커
      const currentMarker = new window.naver.maps.Marker({
        map: newMap,
        position: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
        icon: {
          content: `<div style="width:50px;height:50px;background:url(${drowsy_driving_icon}) no-repeat center/contain;"></div>`,
          anchor: new window.naver.maps.Point(20, 20),
        },
      });
      bounds.extend(currentMarker.getPosition());

      // 휴게소 마커 추가
      restStops.forEach((stop) => {
        const marker = new window.naver.maps.Marker({
          map: newMap,
          position: new window.naver.maps.LatLng(stop.lat, stop.lng),
          title: stop.name,
        });

        // 마커 클릭 이벤트 추가
        window.naver.maps.Event.addListener(marker, 'click', () => {
          setCurrentUrl(stop.url); // 클릭 시 해당 URL로 변경
        });

        bounds.extend(marker.getPosition());
      });

      newMap.fitBounds(bounds);
    }
  };

  if (!isMapVisible) return null;

  if (currentUrl) {
    // 네이버 지도 화면 표시
    return (
      <div style={{ flex: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '10px', marginLeft: '20px' }}>
        <iframe 
          src={currentUrl} 
          style={{ width: '100%', height: '100%', border: 'none' }} 
          title="Naver Map"
        />
        <button 
          style={{ marginTop: '10px', padding: '10px', cursor: 'pointer' }} 
          onClick={() => setCurrentUrl(null)}
        >
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '10px', marginLeft: '20px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}

export default NaverMap;
