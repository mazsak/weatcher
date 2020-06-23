import axios from 'axios';

const URL = "http://api.openweathermap.org/data/2.5";
const APPID = "09bae49ad213dc8b56447ffa2658e390"
class API {
    getWeatherByCity(city) {
        console.log(URL + "/forecast?q=" + city + "&appid=" + APPID);
        return axios.get(URL + "/forecast?q=" + city + "&appid=" + APPID)
            .then((response) => {
                // console.log("response", response.data);
                // console.log("response", response);
                return response.data;
            })
            .catch((error) => {
                console.log("error", error)
            });

    }

    getWeatherByLocation(lat, lon) {
        console.log(URL + "/weather?lat=" + lat + "&lon=" + lon + "&appid=" + APPID);
        return axios.get(URL + "/weather?lat=" + lat + "&lon=" + lon + "&appid=" + APPID)
            .then((response) => {
                // console.log("response", response.data);
                return response.data;
            })
            .catch((error) => {
                console.log("error", error)
            });

    }

    getIcon(icon) {
        return "http://openweathermap.org/img/wn/" + icon + "@4x.png"
    }

}
export default API;