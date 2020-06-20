import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';
import API from '../API';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { ScrollView } from 'react-native-gesture-handler';
import dimens from '../dimenssion';

const size = dimens.size;
const margin = dimens.margin;

const api = new API()
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            city: ["Łomża", "Olmonty"],
            currentCityIndex: 0,
            weather: {},
            typeTemp: 'C'
        }
        this.loadWeather = this.loadWeather.bind(this);
        console.log("size",size);
        this.loadWeather(0);
    }

    async loadWeather(index) {
        await api.getWeatherByCity(this.state.city[index])
            .then(respone => {
                console.log(this.state);
                this.setState({
                    currentCityIndex: index,
                    weather: respone,
                })
            })
            .catch(error =>
                console.log(error)
            );
    }

    calcTime(time) {
        var date = new Date(time * 1000 + this.state.weather.timezone);

        var hours = date.getHours().toString();
        var minutes = date.getMinutes().toString();

        hours = (hours.length === 1 ? "0" : "") + hours;
        minutes = (minutes.length === 1 ? "0" : "") + minutes;

        return hours + ":" + minutes;
    }

    toCelsius(tempK) {
        return (parseFloat(tempK) - 273.15).toFixed(0);
    }

    toFahrenheit(tempK) {
        return (((parseFloat(tempK) - 273.15) * 9 / 5) + 32).toFixed(0)
    }

    componentDidUpdate(preProps) {
        if (preProps != this.props) {
            console.log("State in view", this.state);
        }
    }

    render() {
        return (
            <ScrollView
                style={{
                    flexDirection: 'column',
                    backgroundColor: 'blue'
                }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        margin: margin.small,
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
                            margin: margin.verySmall
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
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            margin: margin.verySmall
                        }}
                    >
                        <TouchableOpacity
                            onPress={(event) =>
                                this.props.navigation.navigate("Add")
                            }
                        >
                            <EvilIcons
                                name="trash"
                                size={size.big}
                                color="white"
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
                            margin: margin.medium
                        }}
                    >
                        <TouchableOpacity
                            onPress={(event) => {
                                if (this.state.currentCityIndex > 0) {
                                    this.loadWeather(this.state.currentCityIndex - 1);
                                }
                            }}
                        >
                            <SimpleLineIcons
                                name="arrow-left"
                                size={size.medium}
                                color="white"
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
                                color: 'white',
                                textAlign: 'center',
                                fontSize: size.medium
                            }}
                        >
                            {this.state.city[this.state.currentCityIndex]}
                        </Text>
                        <Text
                            style={{
                                color: 'white',
                                textAlign: 'center'
                            }}
                        >
                            {this.state.currentCityIndex + 1} / {this.state.city.length}
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            margin: margin.medium,
                            alignItems: 'flex-end'
                        }}
                    >
                        <TouchableOpacity
                            onPress={(event) => {
                                if (this.state.currentCityIndex < this.state.city.length) {
                                    this.loadWeather(this.state.currentCityIndex + 1);
                                }
                            }}
                        >
                            <SimpleLineIcons
                                name="arrow-right"
                                size={size.medium}
                                color="white"
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
                                        color: 'white',
                                        fontSize: size.veryBig
                                    }}
                                >
                                    {this.state.typeTemp === "K" ?
                                        parseFloat(this.state.weather.main.temp).toFixed(0) :
                                        this.state.typeTemp === "C" ?
                                            this.toCelsius(this.state.weather.main.temp) :
                                            this.toFahrenheit(this.state.weather.main.temp)}
                                </Text>
                                <MaterialCommunityIcons
                                    name={this.state.typeTemp === "K" ?
                                        "temperature-kelvin" :
                                        this.state.typeTemp === "C" ?
                                            "temperature-celsius" :
                                            "temperature-fahrenheit"}
                                    size={size.big}
                                    color="white"
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
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: size.medium
                                    }}
                                >
                                    {this.state.weather.weather[0].description.replace(this.state.weather.weather[0].description[0], this.state.weather.weather[0].description[0].toUpperCase())}
                                </Text>
                            </View>
                            <View
                                style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}
                            >
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: size.medium
                                    }}
                                >
                                    {this.state.typeTemp === "K" ?
                                        parseFloat(this.state.weather.main.temp_min).toFixed(0).toString() +
                                        " / " +
                                        parseFloat(this.state.weather.main.temp_max).toFixed(0).toString() :
                                        this.state.typeTemp === "C" ?
                                            this.toCelsius(this.state.weather.main.temp_min).toString() +
                                            " / " +
                                            this.toCelsius(this.state.weather.main.temp_max).toString() :
                                            this.toFahrenheit(this.state.weather.main.temp_min).toString() +
                                            " / " +
                                            this.toFahrenheit(this.state.weather.main.temp_max).toString()}
                                </Text>
                                <MaterialCommunityIcons
                                    name={this.state.typeTemp === "K" ?
                                        "temperature-kelvin" :
                                        this.state.typeTemp === "C" ?
                                            "temperature-celsius" :
                                            "temperature-fahrenheit"}
                                    size={size.small}
                                    color="white"
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
                                <SimpleLineIcons name="drop"
                                    size={size.small}
                                    color="white"
                                    style={{
                                        justifyContent: 'center'
                                    }}
                                />
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: size.medium
                                    }}
                                >
                                    {" " + this.state.weather.main.humidity}%
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
                                        color: 'white',
                                        fontSize: size.medium
                                    }}
                                >
                                    {this.state.weather.main.pressure}hPa
                                </Text>
                            </View>
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                flexDirection: 'row'
                            }}
                            >
                                <View
                                    style={{
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}
                                >
                                    <View
                                        style={{
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: size.muchBigger,
                                            height: size.muchBigger,
                                            borderWidth: size.verySmall,
                                            borderBottomColor: 'transparent',
                                            borderColor: 'gray',
                                            borderRadius: size.veryBig,

                                        }}
                                    >
                                        <View
                                            style={{
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: size.muchBigger,
                                                height: size.muchBigger,
                                                borderWidth: size.verySmall,
                                                borderTopColor: 'transparent',
                                                borderEndColor: 'transparent',
                                                borderEndColor: 'transparent',
                                                borderColor: 'yellow',
                                                borderRadius: size.veryBig,
                                                transform:[{
                                                    rotate: 180
                                                }]
                                            }}
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: 'row'
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontSize: size.medium,
                                                marginRight: margin.big
                                            }}
                                        >
                                            {this.calcTime(this.state.weather.sys.sunrise)}
                                        </Text>
                                        <Text
                                            style={{
                                                color: 'white',
                                                fontSize: size.medium,
                                                marginLeft: margin.big
                                            }}
                                        >
                                            {this.calcTime(this.state.weather.sys.sunset)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                            <View />
                        )}
                </View>
            </ScrollView>
        );
    }
}

export default Home;