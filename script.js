
const API_KEY = 'bb7909fc1b7b45e6ba024608250708';
const BASE_URL = 'https://api.weatherapi.com/v1';

// 페이지 로드 시 서울 날씨를 기본으로 표시
window.addEventListener('load', () => {
    getWeather('Seoul');
});

// 엔터 키로 검색 가능하도록 설정
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

function searchWeather() {
    const city = document.getElementById('cityInput').value.trim();
    if (city) {
        getWeather(city);
    }
}

async function getWeather(city) {
    showLoading();
    
    try {
        // 먼저 국가명인지 확인
        const capitalCity = getCapitalCity(city);
        if (capitalCity) {
            const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${capitalCity}&aqi=no`);
            if (response.ok) {
                const data = await response.json();
                displayWeatherWithCountryInfo(data, city);
                return;
            }
        }
        
        // 한국어 도시명 번역 시도
        const translatedCity = translateKoreanToEnglish(city);
        const searchCity = translatedCity !== city ? translatedCity : city;
        
        const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${searchCity}&aqi=no`);
        
        if (!response.ok) {
            // 검색 결과가 없으면 근처 도시 제안
            await suggestNearbyLocations(city);
            return;
        }
        
        const data = await response.json();
        displayWeather(data);
        
    } catch (error) {
        console.error('Error:', error);
        await suggestNearbyLocations(city);
    }
}

async function suggestNearbyLocations(searchTerm) {
    try {
        // 먼저 국가명인지 확인하고 수도로 변환 시도
        const capitalCity = getCapitalCity(searchTerm);
        if (capitalCity) {
            // 국가명이면 수도 날씨를 가져옴
            const capitalResponse = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${capitalCity}&aqi=no`);
            if (capitalResponse.ok) {
                const capitalData = await capitalResponse.json();
                displayWeatherWithCountryInfo(capitalData, searchTerm);
                return;
            }
        }
        
        const response = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${searchTerm}`);
        
        if (response.ok) {
            const locations = await response.json();
            if (locations.length > 0) {
                showLocationSuggestions(locations);
                return;
            }
        }
        
        // 한국어 도시명 매핑을 시도
        const translatedCity = translateKoreanToEnglish(searchTerm);
        if (translatedCity !== searchTerm) {
            const translatedResponse = await fetch(`${BASE_URL}/search.json?key=${API_KEY}&q=${translatedCity}`);
            if (translatedResponse.ok) {
                const translatedLocations = await translatedResponse.json();
                if (translatedLocations.length > 0) {
                    showLocationSuggestions(translatedLocations);
                    return;
                }
            }
        }
        
        showError();
    } catch (error) {
        console.error('Error:', error);
        showError();
    }
}

function displayWeather(data) {
    const { location, current } = data;
    
    // 위치 정보
    document.getElementById('locationName').textContent = `${location.name}, ${location.country}`;
    document.getElementById('localTime').textContent = `현지 시간: ${formatLocalTime(location.localtime)}`;
    
    // 현재 날씨
    document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
    document.getElementById('temperature').textContent = Math.round(current.temp_c);
    document.getElementById('condition').textContent = translateCondition(current.condition.text);
    
    // 상세 정보
    document.getElementById('feelsLike').textContent = Math.round(current.feelslike_c);
    document.getElementById('humidity').textContent = current.humidity;
    document.getElementById('wind').textContent = current.wind_kph;
    document.getElementById('visibility').textContent = current.vis_km;
    document.getElementById('pressure').textContent = current.pressure_mb;
    document.getElementById('uv').textContent = current.uv;
    
    showWeatherInfo();
}

function displayWeatherWithCountryInfo(data, countryName) {
    const { location, current } = data;
    
    // 위치 정보 (국가 검색 시 수도임을 표시)
    document.getElementById('locationName').textContent = `${location.name}, ${location.country} (${countryName} 수도)`;
    document.getElementById('localTime').textContent = `현지 시간: ${formatLocalTime(location.localtime)}`;
    
    // 현재 날씨
    document.getElementById('weatherIcon').src = `https:${current.condition.icon}`;
    document.getElementById('temperature').textContent = Math.round(current.temp_c);
    document.getElementById('condition').textContent = translateCondition(current.condition.text);
    
    // 상세 정보
    document.getElementById('feelsLike').textContent = Math.round(current.feelslike_c);
    document.getElementById('humidity').textContent = current.humidity;
    document.getElementById('wind').textContent = current.wind_kph;
    document.getElementById('visibility').textContent = current.vis_km;
    document.getElementById('pressure').textContent = current.pressure_mb;
    document.getElementById('uv').textContent = current.uv;
    
    showWeatherInfo();
}

function formatLocalTime(localtime) {
    const date = new Date(localtime);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function translateKoreanToEnglish(koreanCity) {
    const cityTranslations = {
        '서울': 'Seoul',
        '부산': 'Busan',
        '대구': 'Daegu',
        '인천': 'Incheon',
        '광주': 'Gwangju',
        '대전': 'Daejeon',
        '울산': 'Ulsan',
        '수원': 'Suwon',
        '창원': 'Changwon',
        '성남': 'Seongnam',
        '고양': 'Goyang',
        '용인': 'Yongin',
        '부천': 'Bucheon',
        '안산': 'Ansan',
        '안양': 'Anyang',
        '남양주': 'Namyangju',
        '도쿄': 'Tokyo',
        '오사카': 'Osaka',
        '교토': 'Kyoto',
        '베이징': 'Beijing',
        '상하이': 'Shanghai',
        '홍콩': 'Hong Kong',
        '뉴욕': 'New York',
        '런던': 'London',
        '파리': 'Paris',
        '로마': 'Rome',
        '베를린': 'Berlin',
        '모스크바': 'Moscow',
        '시드니': 'Sydney',
        '멜버른': 'Melbourne'
    };
    
    return cityTranslations[koreanCity] || koreanCity;
}

function getCapitalCity(countryName) {
    const countryToCapital = {
        // 한국어 국가명
        '한국': 'Seoul',
        '대한민국': 'Seoul',
        '일본': 'Tokyo',
        '중국': 'Beijing',
        '미국': 'Washington',
        '영국': 'London',
        '프랑스': 'Paris',
        '독일': 'Berlin',
        '이탈리아': 'Rome',
        '스페인': 'Madrid',
        '러시아': 'Moscow',
        '인도': 'New Delhi',
        '브라질': 'Brasilia',
        '캐나다': 'Ottawa',
        '호주': 'Canberra',
        '태국': 'Bangkok',
        '베트남': 'Hanoi',
        '싱가포르': 'Singapore',
        '말레이시아': 'Kuala Lumpur',
        '인도네시아': 'Jakarta',
        '필리핀': 'Manila',
        
        // 영어 국가명
        'Korea': 'Seoul',
        'South Korea': 'Seoul',
        'Japan': 'Tokyo',
        'China': 'Beijing',
        'USA': 'Washington',
        'United States': 'Washington',
        'America': 'Washington',
        'UK': 'London',
        'United Kingdom': 'London',
        'Britain': 'London',
        'England': 'London',
        'France': 'Paris',
        'Germany': 'Berlin',
        'Italy': 'Rome',
        'Spain': 'Madrid',
        'Russia': 'Moscow',
        'India': 'New Delhi',
        'Brazil': 'Brasilia',
        'Canada': 'Ottawa',
        'Australia': 'Canberra',
        'Thailand': 'Bangkok',
        'Vietnam': 'Hanoi',
        'Singapore': 'Singapore',
        'Malaysia': 'Kuala Lumpur',
        'Indonesia': 'Jakarta',
        'Philippines': 'Manila',
        'Netherlands': 'Amsterdam',
        'Belgium': 'Brussels',
        'Switzerland': 'Bern',
        'Austria': 'Vienna',
        'Sweden': 'Stockholm',
        'Norway': 'Oslo',
        'Denmark': 'Copenhagen',
        'Finland': 'Helsinki',
        'Poland': 'Warsaw',
        'Czech Republic': 'Prague',
        'Hungary': 'Budapest',
        'Romania': 'Bucharest',
        'Greece': 'Athens',
        'Turkey': 'Ankara',
        'Egypt': 'Cairo',
        'South Africa': 'Cape Town',
        'Morocco': 'Rabat',
        'Argentina': 'Buenos Aires',
        'Chile': 'Santiago',
        'Peru': 'Lima',
        'Colombia': 'Bogota',
        'Mexico': 'Mexico City',
        'Iran': 'Tehran',
        'Iraq': 'Baghdad',
        'Israel': 'Jerusalem',
        'Jordan': 'Amman',
        'Saudi Arabia': 'Riyadh',
        'UAE': 'Abu Dhabi',
        'Pakistan': 'Islamabad',
        'Bangladesh': 'Dhaka',
        'Sri Lanka': 'Colombo',
        'Myanmar': 'Naypyidaw',
        'Cambodia': 'Phnom Penh',
        'Laos': 'Vientiane',
        'Mongolia': 'Ulaanbaatar',
        'Kazakhstan': 'Nur-Sultan',
        'Uzbekistan': 'Tashkent',
        'Afghanistan': 'Kabul',
        'Nepal': 'Kathmandu',
        'Bhutan': 'Thimphu'
    };
    
    return countryToCapital[countryName];
}

function translateCondition(condition) {
    const translations = {
        'Sunny': '맑음',
        'Clear': '맑음',
        'Partly cloudy': '구름 조금',
        'Cloudy': '흐림',
        'Overcast': '흐림',
        'Mist': '안개',
        'Patchy rain possible': '비 가능성',
        'Patchy snow possible': '눈 가능성',
        'Patchy sleet possible': '진눈깨비 가능성',
        'Patchy freezing drizzle possible': '어는 이슬비 가능성',
        'Thundery outbreaks possible': '천둥번개 가능성',
        'Blowing snow': '눈보라',
        'Blizzard': '블리자드',
        'Fog': '안개',
        'Freezing fog': '어는 안개',
        'Patchy light drizzle': '가벼운 이슬비',
        'Light drizzle': '이슬비',
        'Freezing drizzle': '어는 이슬비',
        'Heavy freezing drizzle': '강한 어는 이슬비',
        'Patchy light rain': '가벼운 비',
        'Light rain': '가벼운 비',
        'Moderate rain at times': '보통 비',
        'Moderate rain': '보통 비',
        'Heavy rain at times': '강한 비',
        'Heavy rain': '폭우',
        'Light freezing rain': '가벼운 어는 비',
        'Moderate or heavy freezing rain': '어는 비',
        'Light sleet': '가벼운 진눈깨비',
        'Moderate or heavy sleet': '진눈깨비',
        'Patchy light snow': '가벼운 눈',
        'Light snow': '가벼운 눈',
        'Patchy moderate snow': '보통 눈',
        'Moderate snow': '보통 눈',
        'Patchy heavy snow': '폭설',
        'Heavy snow': '폭설',
        'Ice pellets': '얼음 알갱이',
        'Light rain shower': '소나기',
        'Moderate or heavy rain shower': '강한 소나기',
        'Torrential rain shower': '집중호우',
        'Light sleet showers': '가벼운 진눈깨비 소나기',
        'Moderate or heavy sleet showers': '진눈깨비 소나기',
        'Light snow showers': '가벼운 눈 소나기',
        'Moderate or heavy snow showers': '눈 소나기',
        'Patchy light rain with thunder': '천둥을 동반한 가벼운 비',
        'Moderate or heavy rain with thunder': '천둥을 동반한 비',
        'Patchy light snow with thunder': '천둥을 동반한 가벼운 눈',
        'Moderate or heavy snow with thunder': '천둥을 동반한 눈'
    };
    
    return translations[condition] || condition;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('weatherInfo').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

function showWeatherInfo() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('weatherInfo').style.display = 'block';
    document.getElementById('error').style.display = 'none';
}

function showLocationSuggestions(locations) {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = `
        <h3>검색 결과를 찾을 수 없습니다. 다음 중에서 선택해주세요:</h3>
        <div class="location-suggestions">
            ${locations.slice(0, 5).map(location => `
                <button class="suggestion-btn" onclick="selectLocation('${location.name}')">
                    ${location.name}, ${location.region}, ${location.country}
                </button>
            `).join('')}
        </div>
        <p style="margin-top: 15px; font-size: 14px; color: #636e72;">
            원하는 위치가 없다면 영어로 다시 검색해보세요.
        </p>
    `;
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('weatherInfo').style.display = 'none';
    errorDiv.style.display = 'block';
}

function selectLocation(locationName) {
    document.getElementById('cityInput').value = locationName;
    getWeather(locationName);
}

function showError() {
    const errorDiv = document.getElementById('error');
    errorDiv.innerHTML = '<p>날씨 정보를 불러올 수 없습니다. 도시명을 확인해주세요.</p>';
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('weatherInfo').style.display = 'none';
    errorDiv.style.display = 'block';
}
