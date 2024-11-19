import { useEffect, useRef, useState } from 'react';
import drowsy_driving_icon from './assets/drowsy_driving_icon.png';

function NaverMap({ isMapVisible }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false);
  const [userMarker, setUserMarker] = useState(null); // 사용자의 현재 위치 마커 상태 추가

  // 휴게소 목록
  const restStops = [
    {
      name: '서부산휴게소',
      lat: 35.157258,
      lng: 128.948777,
      url: 'https://map.naver.com/v5/search/%EC%84%9C%EB%B6%80%EC%82%B0%ED%9C%B4%EA%B2%8C%EC%86%8C',
    },
    {
      name: '김해금관가야휴게소',
      lat: 35.269933,
      lng: 129.003134,
      url: 'https://map.naver.com/v5/search/%EA%B9%80%ED%95%B4%EA%B8%88%EA%B4%80%EA%B0%80%EC%95%BC%ED%9C%B4%EA%B2%8C%EC%86%8C',
    },
    {
      name: '양산휴게소',
      lat: 35.323172,
      lng: 129.056867,
      url: 'https://map.naver.com/v5/search/%EC%96%91%EC%82%B0%ED%9C%B4%EA%B2%8C%EC%86%8C',
    },
    {
      name: '장안휴게소(울산방향)',
      lat: 35.381033,
      lng: 129.248737,
      url: 'https://map.naver.com/v5/search/%EC%9E%A5%EC%95%88%ED%9C%B4%EA%B2%8C%EC%86%8C',
    },
  ];

  // 네이버 지도 스크립트 로드
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

  // 현재 위치 가져오기
  useEffect(() => {
    if (isMapScriptLoaded) {
      const success = (location) => {
        const newLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };
        setCurrentLocation(newLocation);
      };

      const error = () => {
        const defaultLocation = { lat: 37.5666103, lng: 126.9783882 }; // 서울시청 기본 좌표
        setCurrentLocation(defaultLocation);
      };

      if (navigator.geolocation) {
        // 현재 위치 추적 (watchPosition 사용)
        const watcher = navigator.geolocation.watchPosition(success, error, {
          enableHighAccuracy: true,
        });
        return () => navigator.geolocation.clearWatch(watcher); // 컴포넌트 언마운트 시 watcher 해제
      } else {
        error();
      }
    }
  }, [isMapScriptLoaded]);

  // 지도 초기화 및 업데이트
  useEffect(() => {
    if (currentLocation && window.naver && window.naver.maps) {
      if (!map) {
        // 지도 초기화
        const mapOptions = {
          center: new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng),
          zoom: 9,
        };
        const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
        setMap(newMap);

        // 현재 위치 마커 초기화
        const marker = new window.naver.maps.Marker({
          map: newMap,
          position: mapOptions.center,
          icon: {
            content: `<div style="width:50px;height:50px;background:url(${drowsy_driving_icon}) no-repeat center/contain;"></div>`,
            anchor: new window.naver.maps.Point(25, 25),
          },
        });
        setUserMarker(marker); // 마커 상태 업데이트

        // 휴게소 마커 추가
        restStops.forEach((stop) => {
          const marker = new window.naver.maps.Marker({
            map: newMap,
            position: new window.naver.maps.LatLng(stop.lat, stop.lng),
            title: stop.name,
          });

          // 마커 클릭 이벤트
          window.naver.maps.Event.addListener(marker, 'click', () => {
            window.open(stop.url, '_blank');
          });
        });
      } else {
        // 지도 중심 업데이트
        const newCenter = new window.naver.maps.LatLng(currentLocation.lat, currentLocation.lng);
        map.setCenter(newCenter);

        // 사용자의 현재 위치 마커 업데이트
        if (userMarker) {
          userMarker.setPosition(newCenter);
        }
      }
    }
  }, [currentLocation, map]);

  // 지도가 보이지 않을 경우 렌더링 중단
  if (!isMapVisible) return null;

  return (
    <div style={{ flex: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd', borderRadius: '10px', marginLeft: '20px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}

export default NaverMap;
