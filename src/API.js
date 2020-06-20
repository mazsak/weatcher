import axios from 'axios';

const URL = "http://api.openweathermap.org/data/2.5";
const APPID = "09bae49ad213dc8b56447ffa2658e390"
class API {
    getWeatherByCity(city) {
        console.log('game');
        return axios.get(URL + "/weather?q=" + city + "&appid=" + APPID)
            .then((response) => {
                console.log("response", response.data);
                return response.data;
            })
            .catch((error) => {
                console.error("error", error)
            });

    }
}
export default API;