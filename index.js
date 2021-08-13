// https://picsum.photos/200/300
// img src="~~"
async function setRenderBackground(){
    // 객체의 비구조화 할당 {data} = result.data
    const {data} = await axios.get('https://picsum.photos/1280/720', {
        // blob 속성은 이미지, 사운드, 비디오등의 멀티미디어 데이터를 다룰 때 사용
        responseType:'blob',
    });
    // console.log(data);
    const imageURL = URL.createObjectURL(data);
    document.querySelector("body").style.backgroundImage = `url(${imageURL})`
}

function setTime() {
    let nowStr = '';
    const timer = document.querySelector('.timer');
    setInterval(() => {
        const date = new Date();
        timer.textContent = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        if (date.getHours() >= 18) nowStr = 'Good Night';
        else if (date.getHours() >= 12) nowStr = 'Good Evening';
        else if (date.getHours() < 6) nowStr = 'Sleepy Dawn';
        else nowStr = 'Good Moring';
        document.querySelector('.timer-content').textContent = `${nowStr}, Hayoung`
    }, 1000);
}

// 메모를 불러와서 HTML에 불러주는 renderingMemo
function renderingMemo(){
    const memo = document.querySelector('.memo');
    const memoValue = localStorage.getItem('todo');
    memo.textContent = memoValue;
    
    // data를 -> html과 일치화
    // html은 데이터와 html을 일치화시켜야한다
}

function setMemo(){
    const memoInput = document.querySelector('.memo-input');
    memoInput.addEventListener('keyup', function(e){
        // console.log(e.code);
        // console.log(e.target.value);
        // e.target.value !== undefined
        // && e.target.value !== null
        // && e.target.value !== ""
        // && e.target.value !== 0
        if((e.code === 'Enter' || e.code === 'NumpadEnter') && e.target.value){
            localStorage.setItem('todo', e.target.value);
            renderingMemo()
            memoInput.value = "";
        }
    })
}

function addDeleteMemoEvent() {
    document.addEventListener('click', function(e){
        if(e.target.classList.contains("memo")){
            // LocalStorage 로부터 데이터를 지운다.
            localStorage.removeItem('todo');
            // 데이터와 html의 일치화로 html에 있는 내용도 비워줘야한다.
            e.target.textContent = '';
        }
    })
}

function getPosition(options){
    return new Promise(function(resolve, reject){
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

async function getWeatherAPI(latitude,longitude){
    // 위도와 경도가 있는 경우
    const API_KEY = 'cdfa63ba83d3f81a126ccbc6249bf82f';
    // api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
    if(latitude & longitude){
        const result = await axios.get(
            `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
        );
        return result;
    }
    // 위도와 경도가 없는 경우
    // 없는경우에는 서울의 날씨데이터를 가져온다.
    // api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}
    const result = await axios.get(
    `http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=${API_KEY}`
    );
    return result;
}

function matchIcon(weatherData){
    // Clear
    if(weatherData === "Clear") return "/WEB/w2-day05/images/039-sun.png";
    // Clouds
    if(weatherData === "Clouds") return "/WEB/w2-day05/images/001-cloud.png";
    // Rain
    if(weatherData === "Rain") return "/WEB/w2-day05/images/003-rainy.png";
    // Snow
    if(weatherData === "Snow") return "/WEB/w2-day05/images/006-snowy.png";
    // Thunderstorm
    if(weatherData === "Thunderstorm") return "/WEB/w2-day05/images/008-storm.png";
    // Drizzle
    if(weatherData === "Drizzle") return "/WEB/w2-day05/images/031-snowflake.png";
    // Atmosphere
    if(weatherData === "Atmosphere") return "/WEB/w2-day05/images/033-hurricane.png";
}

function weatherWrapperComponent(li)
{
    const changeToCelsius = (temp) => (temp - 273.15).toFixed(1);
    
    return `
    <div class="card shadow-sm bg-transparent m-2 flex-grow-1">
        <div class="card-header text-white text-center">
        ${li.dt_txt.split(' ')[0]}
        </div>
        <div class="card-body d-flex">
            <!-- 반복구간 -->
            <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                <h5 class="card-title">
                    ${li.weather[0].main}
                </h5>
                <img src=${matchIcon(li.weather[0].main)} width="60px" height="60px" />
                <p class="card-text">
                ${changeToCelsius(li.main.temp)}˚
                </p>
            </div>
        </div>
    </div>
    `
}

async function renderWeather(){
    let latitude = '';
    let longitude = '';
    try {
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        
    } catch (error) {
        console.log(error)
    }
    // 해당 뒤도 경도를 기반으로 날씨 API를 불러오기
    // 날씨를 불러오는 API호출 생성
    const weatherResult = await getWeatherAPI(latitude,longitude);
    // weatherResult.data.list
    const {list} = weatherResult.data;
    const weatherList = list.reduce((acc, cur) => {
        if(cur.dt_txt.indexOf('18:00:00')>0){
            acc.push(cur);
        }
        return acc;
    },[]);
    console.log(weatherList);
    // modal body에 데이터를 기반으로 Html과 일치화
    const modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = weatherList.reduce((acc,cur) => {
        // 해당 부분에 컴포넌트 형식으로 데이터를 넣어줘야 한다.
        acc += weatherWrapperComponent(cur);

        return acc;
    },"")
    document.querySelector(".modal-button").style.backgroundImage = `url(${matchIcon(weatherList[0].weather[0].main)})`
}

// IIFE 즉시 실행함수
(function(){
    setRenderBackground();

    setInterval(() => {
        setRenderBackground();
    }, 5000);
    // 시간 설정
    setTime();
    // 메모 설정
    setMemo();
    renderingMemo()
    addDeleteMemoEvent()
    // 날씨 설정
    renderWeather();
})();