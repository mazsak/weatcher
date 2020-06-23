import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert
} from 'react-native';
import API from '../API';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ScrollView } from 'react-native-gesture-handler';
import dimens from '../dimenssion';
import colors from '../colors';
import db from '../database';
import { NavigationEvents } from 'react-navigation';
import NetInfo from "@react-native-community/netinfo";


db.transaction(txn => {
    txn.executeSql(
        "CREATE TABLE IF NOT EXISTS " +
        "city(" +
        "id integer PRIMARY KEY AUTOINCREMENT," +
        " city text," +
        " lon integer," +
        " lat integer," +
        " country text)",
        []
    );
});

const size = dimens.size;
const margin = dimens.margin;

const api = new API()
var network = false;
const unsubscribe = NetInfo.addEventListener(state => {
    if (state.isConnected){
        network = true;
    }else{
        network =false;
    }
  });

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            city: [],
            currentCityIndex: 0,
            weather: {},
            typeTemp: 'C',
            isLoading: false,
            hours: {},
            network: false
        }
        this.loadCity()
    }

    deleteCurrentCity() {
        db
            .transaction(txn => {
                txn.executeSql(
                    'DELETE FROM  city where id=?',
                    [this.state.city[this.state.currentCityIndex].id]
                );
                this.state.city.splice(this.state.currentCityIndex, 1);
                this.setState({
                    weather: {},
                    hours: {},
                    currentCityIndex: 0
                });
                this.loadCity();
            });
    }

    loadCity() {
        db
            .transaction(txn => {
                txn.executeSql(
                    'select * from city',
                    [],
                    (tx, results) => {
                        var temp = [];
                        for (var i = 0; i < results.rows.length; i++) {
                            temp.push(results.rows.item(i));
                            this.setState({
                                city: temp
                            });
                        }
                        if (temp.length !== 0) {
                            this.loadWeather(0);
                        }
                    },
                    (tx, results) => {
                        console.log("Problem", tx); console.log(results)
                    });
            });
    }

    componentDidUpdate(){
        if (network && network !== this.state.network){
            this.setState({
                network: true
            });
            this.loadWeather(0);
        }
    }

    loadWeather(index) {
        if (network){
        api.getWeatherByCity(this.state.city[index].city)
            .then(respone => {
                var hours = respone;
                this.setState({
                    currentCityIndex: index,
                    weather: respone,
                    hours: { list: hours.list.slice(0, 8) }
                })
            })
            .catch(error =>
                console.log(error)
            );
        }else{
            this.setState({
                network: false
            })
            Alert.alert(
                "Information",
                "You mast turn on network!",
                [
                    {
                        text: "Ok"
                    }
                ]
            );
        }
    }

    calcTime(time) {
        var date = new Date(time * 1000 + this.state.weather.city.timezone);

        var hours = date.getHours().toString();
        var minutes = date.getMinutes().toString();

        hours = (hours.length === 1 ? "0" : "") + hours;
        minutes = (minutes.length === 1 ? "0" : "") + minutes;

        return hours + ":" + minutes;
    }

    getDirectory(deg) {
        switch (parseInt(parseInt(deg) / 30)) {
            case 11, 0:
                return "N";
            case 1:
                return "NE";
            case 2, 3:
                return "E";
            case 4:
                return "SE";
            case 5, 6:
                return "S";
            case 7:
                return "SW";
            case 8, 9:
                return "W";
            case 10:
                return "NW";
            default:
                return "N";
        }

    }

    getTemperature(temp) {
        return this.state.typeTemp === "C" ?
            this.toCelsius(temp) :
            this.state.typeTemp === "F" ?
                this.toCelsius(temp) :
                parseFloat(temp).toFixed(0);
    }

    toCelsius(tempK) {
        return (parseFloat(tempK) - 273.15).toFixed(0);
    }

    toFahrenheit(tempK) {
        return (((parseFloat(tempK) - 273.15) * 9 / 5) + 32).toFixed(0)
    }

    viewDay() {
        let date = this.state.weather.list[0].dt_txt.split(" ")[0];
        const days = [];
        let icon = [this.state.weather.list[0].weather[0].icon];
        let humidity = [this.state.weather.list[0].main.humidity];
        let temp = [this.state.weather.list[0].main.temp_max, this.state.weather.list[0].main.temp_min];
        let clouds = [this.state.weather.list[0].clouds.all];
        for (var i = 1; i < this.state.weather.list.length; i++) {
            if (date === this.state.weather.list[i].dt_txt.split(" ")[0]) {
                icon.push(this.state.weather.list[i].weather[0].icon);
                humidity.push(this.state.weather.list[i].main.humidity);
                temp.push(this.state.weather.list[i].main.temp_max);
                temp.push(this.state.weather.list[i].main.temp_min);
                clouds.push(this.state.weather.list[i].clouds.all);
            } else {
                icon.sort();
                humidity.sort();
                temp.sort();
                clouds.sort();
                days.push({
                    date: date,
                    icon: icon[icon.length / 2],
                    temp_min: temp[0],
                    temp_max: temp[temp.length - 1],
                    clouds: parseFloat(clouds.reduce((a, b) => a + b) / clouds.length).toFixed(0),
                    humidity: parseFloat(humidity.reduce((a, b) => a + b) / humidity.length).toFixed(0)
                });
                icon = [];
                humidity = [];
                temp = [];
                clouds = [];
                date = this.state.weather.list[i].dt_txt.split(" ")[0];
                icon.push(this.state.weather.list[i].weather[0].icon);
                humidity.push(this.state.weather.list[i].main.humidity);
                temp.push(this.state.weather.list[i].main.temp_max);
                temp.push(this.state.weather.list[i].main.temp_min);
                clouds.push(this.state.weather.list[i].clouds.all);
            }
        }
        const items = [];
        for (i = 0; i < days.length; i++) {
            items.push(<View
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    marginRight: margin.medium,
                    marginBottom: margin.medium
                }}
            >
                <Text
                    style={{
                        color: colors.text
                    }}
                >
                    {days[i].date}
                </Text>
                <Image
                    style={{
                        width: size.big,
                        height: size.big
                    }}
                    source={{
                        uri: api.getIcon(days[i].icon)
                    }}
                />
                <View
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}
                >
                    <AntDesign
                        name="cloudo"
                        size={size.small}
                        color={colors.text}
                    />
                    <Text
                        style={{
                            color: colors.text
                        }}
                    >
                        {" " + days[i].clouds}%
                    </Text>
                </View>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}
                >
                    <SimpleLineIcons name="drop"
                        size={size.small}
                        color={colors.text}
                        style={{
                            justifyContent: 'center'
                        }}
                    />
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: size.medium
                        }}
                    >
                        {" " + days[i].humidity}%
    </Text>
                </View>
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}
                >
                    <Text
                        style={{
                            color: colors.text,
                            fontSize: size.medium
                        }}
                    >
                        {this.getTemperature(days[i].temp_min).toString() +
                            " / " +
                            this.getTemperature(days[i].temp_max).toString()}
                    </Text>
                    <MaterialCommunityIcons
                        name={this.state.typeTemp === "K" ?
                            "temperature-kelvin" :
                            this.state.typeTemp === "C" ?
                                "temperature-celsius" :
                                "temperature-fahrenheit"}
                        size={size.small}
                        color={colors.text}
                        style={{
                            justifyContent: 'center'
                        }}
                    />
                </View>
            </View>
            );
        }
        return items;
    }

    render() {
        return (
            <ScrollView
                style={{
                    flexDirection: 'column',
                    backgroundColor: colors.background
                }}
            >
                <NavigationEvents
                    onDidFocus={() => this.loadCity()}
                />
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        padding: margin.small,
                        justifyContent: 'flex-end'
                    }}
                >
                    <View
                        style={{
                            flex: 7,
                            flexDirection: 'column'
                        }}
                    />
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            padding: margin.verySmall
                        }}
                    >
                        <TouchableOpacity
                            onPress={(event) =>
                                this.props.navigation.navigate("Add")
                            }
                        >
                            <EvilIcons
                                name="plus"
                                size={size.big}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            padding: margin.verySmall
                        }}
                    >
                        <TouchableOpacity
                            onPress={(event) =>
                                this.deleteCurrentCity()
                            }
                        >
                            <EvilIcons
                                name="trash"
                                size={size.big}
                                color={colors.text}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row'
                    }}
                >
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            padding: margin.medium
                        }}
                    >
                        <TouchableOpacity
                            onPress={(event) => {
                                if (this.state.city.length > 1) {
                                    if (this.state.currentCityIndex > 0) {
                                        this.loadWeather(this.state.currentCityIndex - 1);
                                    } else {
                                        this.loadWeather(this.state.city.length - 1);
                                    }
                                }
                            }}
                        >
                            <SimpleLineIcons
                                name="arrow-left"
                                size={size.medium}
                                color={colors.text}
                                style={{
                                    justifyContent: 'center'
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            flex: 8,
                            flexDirection: 'column'
                        }}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                textAlign: 'center',
                                fontSize: size.medium
                            }}
                        >
                            {this.state.city.length !== 0 ? this.state.city[this.state.currentCityIndex].city : "Empty"}
                        </Text>
                        <Text
                            style={{
                                color: colors.text,
                                textAlign: 'center'
                            }}
                        >
                            {this.state.city.length !== 0 ? this.state.currentCityIndex + 1 : 0} / {this.state.city.length}
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            padding: margin.medium,
                            alignItems: 'flex-end'
                        }}
                    >
                        <TouchableOpacity
                            onPress={(event) => {
                                if (this.state.city.length > 1) {
                                    if (this.state.currentCityIndex < this.state.city.length - 1) {
                                        this.loadWeather(this.state.currentCityIndex + 1);
                                    } else {
                                        this.loadWeather(0);
                                    }
                                }
                            }}
                        >
                            <SimpleLineIcons
                                name="arrow-right"
                                size={size.medium}
                                color={colors.text}
                                style={{
                                    justifyContent: 'center'
                                }}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={{
                        flex: 10,
                        flexDirection: 'row'
                    }}
                >
                    {Object.keys(this.state.weather).length !== 0 && this.state.weather.constructor === Object ? (
                        <View
                            style={{
                                flex: 10,
                                flexDirection: 'column'
                            }}
                        >
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flex: 1,
                                    flexDirection: 'row'
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontSize: size.veryBig
                                    }}
                                >
                                    {this.getTemperature(this.state.weather.list[0].main.temp)}
                                </Text>
                                <MaterialCommunityIcons
                                    name={this.state.typeTemp === "K" ?
                                        "temperature-kelvin" :
                                        this.state.typeTemp === "C" ?
                                            "temperature-celsius" :
                                            "temperature-fahrenheit"}
                                    size={size.big}
                                    color={colors.text}
                                    style={{
                                        justifyContent: 'center'
                                    }}
                                />
                            </View>
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}
                            >
                                <Image
                                    style={{
                                        width: 100,
                                        height: 100
                                    }}
                                    source={{
                                        uri: api.getIcon(this.state.weather.list[0].weather[0].icon)
                                    }}
                                />
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontSize: size.medium
                                    }}
                                >
                                    {this.state.weather.list[0].weather[0].description.replace(this.state.weather.list[0].weather[0].description[0], this.state.weather.list[0].weather[0].description[0].toUpperCase())}
                                </Text>
                            </View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    borderWidth: 1,
                                    borderColor: colors.background,
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        borderWidth: 1,
                                        borderColor: colors.background,
                                        borderEndColor: colors.text
                                    }}
                                >
                                    <View
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <View
                                            style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: colors.text,
                                                    fontSize: size.medium
                                                }}
                                            >
                                                Temperature MIN/MAX
                                            </Text>
                                            <View
                                                style={{
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: colors.text,
                                                        fontSize: size.medium
                                                    }}
                                                >
                                                    {this.getTemperature(this.state.weather.list[0].main.temp_min).toString() +
                                                        " / " +
                                                        this.getTemperature(this.state.weather.list[0].main.temp_max).toString()}
                                                </Text>
                                                <MaterialCommunityIcons
                                                    name={this.state.typeTemp === "K" ?
                                                        "temperature-kelvin" :
                                                        this.state.typeTemp === "C" ?
                                                            "temperature-celsius" :
                                                            "temperature-fahrenheit"}
                                                    size={size.small}
                                                    color={colors.text}
                                                    style={{
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                <View style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'column'
                                }}
                                >
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: size.medium
                                        }}
                                    >
                                        Humidity
                                            </Text>
                                    <View style={{
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                    }}
                                    >
                                        <SimpleLineIcons name="drop"
                                            size={size.small}
                                            color={colors.text}
                                            style={{
                                                justifyContent: 'center'
                                            }}
                                        />
                                        <Text
                                            style={{
                                                color: colors.text,
                                                fontSize: size.medium
                                            }}
                                        >
                                            {" " + this.state.weather.list[0].main.humidity}%
                                </Text>
                                    </View>
                                </View>
                            </View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    borderWidth: 1,
                                    borderColor: colors.background,
                                    borderTopColor: colors.text
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        width: '100%',
                                        borderWidth: 1,
                                        borderColor: colors.background,
                                        borderEndColor: colors.text
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: size.medium
                                        }}
                                    >
                                        Pressure
                                            </Text>
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: size.medium
                                        }}
                                    >
                                        {this.state.weather.list[0].main.pressure}hPa
                                </Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: size.medium
                                        }}
                                    >
                                        Wind
                                            </Text>
                                    <View
                                        style={{
                                            flex: 1,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <Entypo
                                                    name="direction"
                                                    size={size.small}
                                                    color={colors.text}
                                                    style={{
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                                <Text
                                                    style={{
                                                        color: colors.text,
                                                        fontSize: size.medium
                                                    }}
                                                >
                                                    {" " + this.getDirectory(this.state.weather.list[0].wind.deg)}
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <View
                                                style={{
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <MaterialCommunityIcons
                                                    name="weather-windy"
                                                    size={size.small}
                                                    color={colors.text}
                                                    style={{
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                                <Text
                                                    style={{
                                                        color: colors.text,
                                                        fontSize: size.medium
                                                    }}
                                                >
                                                    {" " + this.state.weather.list[0].wind.speed}m/s
                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    borderWidth: 1,
                                    borderColor: colors.background,
                                    borderTopColor: colors.text
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                        borderWidth: 1,
                                        borderColor: colors.background,
                                        borderEndColor: colors.text
                                    }}
                                >
                                    <View
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.text,
                                                fontSize: size.medium
                                            }}
                                        >
                                            Clouds
                                        </Text>

                                    </View>
                                    <View
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <AntDesign
                                            name="cloudo"
                                            size={size.small}
                                            color={colors.text}
                                        />
                                        <Text
                                            style={{
                                                color: colors.text,
                                                fontSize: size.medium
                                            }}
                                        >
                                            {" " + this.state.weather.list[0].clouds.all}%
                                    </Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: size.medium
                                        }}
                                    >
                                        Sunrise - Sunset
                                        </Text>
                                    <Text
                                        style={{
                                            color: colors.text,
                                            fontSize: size.medium
                                        }}
                                    >
                                        {this.calcTime(this.state.weather.city.sunrise)} - {this.calcTime(this.state.weather.city.sunset)}
                                    </Text>
                                </View>
                            </View>
                            <View style={{
                                flexDirection: 'row'
                            }}
                            >
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontSize: size.medium,
                                        margin: margin.small
                                    }}
                                >
                                    Weather for day
                                </Text>
                            </View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}
                            >
                                <ScrollView
                                    horizontal={true}
                                >
                                    {this.state.hours.list.map((hour, index) =>
                                        (<View
                                            style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                marginRight: margin.medium,
                                                marginBottom: margin.medium
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: colors.text
                                                }}
                                            >
                                                {hour.dt_txt.toString().substring(0, hour.dt_txt.length - 3).split(' ')[1]}
                                            </Text>
                                            <Image
                                                style={{
                                                    width: size.big,
                                                    height: size.big
                                                }}
                                                source={{
                                                    uri: api.getIcon(this.state.weather.list[index].weather[0].icon)
                                                }}
                                            />
                                            <View
                                                style={{
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    flexDirection: 'row'
                                                }}
                                            >
                                                <AntDesign
                                                    name="cloudo"
                                                    size={size.small}
                                                    color={colors.text}
                                                />
                                                <Text
                                                    style={{
                                                        color: colors.text
                                                    }}
                                                >
                                                    {" " + hour.clouds.all}%
                                                </Text>
                                            </View>
                                            <View style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'row'
                                            }}
                                            >
                                                <SimpleLineIcons name="drop"
                                                    size={size.small}
                                                    color={colors.text}
                                                    style={{
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                                <Text
                                                    style={{
                                                        color: colors.text,
                                                        fontSize: size.medium
                                                    }}
                                                >
                                                    {" " + hour.main.humidity}%
                                </Text>
                                            </View>
                                            <View style={{
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'row'
                                            }}
                                            >
                                                <Text
                                                    style={{
                                                        color: colors.text,
                                                        fontSize: size.medium
                                                    }}
                                                >
                                                    {this.getTemperature(hour.main.temp_min).toString() +
                                                        " / " +
                                                        this.getTemperature(hour.main.temp_max).toString()}
                                                </Text>
                                                <MaterialCommunityIcons
                                                    name={this.state.typeTemp === "K" ?
                                                        "temperature-kelvin" :
                                                        this.state.typeTemp === "C" ?
                                                            "temperature-celsius" :
                                                            "temperature-fahrenheit"}
                                                    size={size.small}
                                                    color={colors.text}
                                                    style={{
                                                        justifyContent: 'center'
                                                    }}
                                                />
                                            </View>
                                        </View>)
                                    )}
                                </ScrollView>
                            </View>
                            <View style={{
                                flexDirection: 'row'
                            }}
                            >
                                <Text
                                    style={{
                                        color: colors.text,
                                        fontSize: size.medium,
                                        margin: margin.small
                                    }}
                                >
                                    Weather for five days
                                </Text>
                            </View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}
                            >
                                <ScrollView
                                    horizontal={true}
                                >
                                    {this.viewDay()}
                                </ScrollView>
                            </View>
                        </View>
                    ) : (
                            <View />
                        )}
                </View>
            </ScrollView >
        );
    }
}

export default Home;