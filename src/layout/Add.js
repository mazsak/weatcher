import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ToastAndroid,
    Alert,
} from 'react-native';
import API from '../API';
import { Searchbar, ActivityIndicator } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import dimens from '../dimenssion';
import colors from '../colors';
import geolocation from '@react-native-community/geolocation';
import db from '../database';
import Item from '../Item';
import PushNotification from "react-native-push-notification";




const size = dimens.size;
const margin = dimens.margin;

const api = new API()

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: "",
            data: [],
            isLoading: false
        }
    }

    addCity(r) {
        db.transaction(tx =>
            tx.executeSql(
                'select * from city',
                [],
                (tx, results) => {
                    const items = [];
                    for (var i = 0; i < results.rows.length; i++) {
                        items.push(results.rows.item(i).city.toString().replace(" County", ""));
                    }
                    var index = items.indexOf(r.name.toString().replace(" County", ""));
                    if (index > -1) {
                        ToastAndroid.show(
                            "City \"" + r.name.toString().replace(" County", "") + "\" is exist in list",
                            ToastAndroid.LONG
                        );
                        this.props.navigation.navigate('Home');
                    } else {
                        tx.executeSql(
                            'INSERT INTO city (city, lon, lat, country) VALUES (?,?,?,?)',
                            [r.name.toString().replace(" County", ""), r.coord.lon, r.coord.lat, r.country],
                            (tx, res) => {
                                if (res.rowsAffected > 0) {
                                    ToastAndroid.show(
                                        "Add new city: \"" + r.name.toString().replace(" County", "") + "\"",
                                        ToastAndroid.LONG
                                    );
                                    this.props.navigation.navigate('Home');
                                }
                            },
                            (tx, results) => {
                                console.log("Problem", tx); console.log(results)
                            }
                        )
                    }
                },
                (tx, results) => {
                    console.log("Problem", tx); console.log(results)
                }
            ));
    }


    render() {
        return (
            <View>
                <View>
                    <Searchbar
                        placeholder="Search city..."
                        onSubmitEditing={() => {
                            this.setState({
                                isLoading: true
                            });
                            api.getWeatherByCity(this.state.search)
                                .then((r) => {
                                    console.log("in search r", r)
                                    if (r !== undefined) {
                                        this.setState({
                                            data: [r]
                                        });
                                    } else {
                                        this.setState({
                                            data: []
                                        });
                                    }
                                    this.setState({
                                        isLoading: false
                                    });
                                    console.log("in search state", this.state.data)
                                })
                                .catch(error =>
                                    console.log("here", error)
                                )
                        }}
                        onChangeText={city => {
                            this.setState({
                                search: city
                            });
                            console.log(city);
                        }}
                        onIconPress
                        value={this.state.search}
                        icon={() =>
                            <AntDesign name="arrowleft" size={size.smallBig} />
                        }
                        onIconPress={() => this.props.navigation.goBack()}
                    />
                </View>
                <View
                    style={{
                        flexDirection: 'column',
                        margin: margin.small
                    }}
                >
                    <TouchableOpacity
                        style={{
                            backgroundColor: colors.background
                        }}
                        onPress={() => {
                            this.setState({
                                isLoading: true
                            });
                            geolocation.getCurrentPosition(info => {
                                this.setState({
                                    isLoading: false
                                });
                                console.log("location", info.coords);
                                Alert.alert(
                                    "Information",
                                    "Are you sure you want to add the city?",
                                    [
                                        {
                                            text: 'Yes',
                                            onPress: () => {
                                                api.getWeatherByLocation(info.coords.latitude, info.coords.longitude)
                                                    .then((r) => {
                                                        this.addCity({
                                                            name: r.name,
                                                            coord: {
                                                                lat: r.coord.lat,
                                                                lon: r.coord.lon
                                                            },
                                                            country: r.sys.country
                                                        });
                                                    })
                                                    .catch(error =>
                                                        console.log(error)
                                                    );
                                            }
                                        },
                                        {
                                            text: 'No',
                                            style: 'cancel'
                                        }
                                    ],
                                    { cancelable: false }
                                );
                            },
                                error => {
                                    this.setState({
                                        isLoading: false
                                    });
                                    Alert.alert(
                                        "Information",
                                        "You mast turn on GPS and network!",
                                        [{ text: "OK" }]
                                    );
                                },
                                { enableHighAccuracy: false, timeout: 2000, maximumAge: 1000 }
                            );
                        }}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                textAlign: 'center',
                                fontSize: size.smallBig
                            }}
                        >
                            Your location
                        </Text>
                    </TouchableOpacity>
                    <FlatList
                        data={this.state.data}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) =>
                            (<Item item={item} navigation={this.props.navigation} />)
                        }
                    />
                    <ActivityIndicator
                        animating={this.state.isLoading}
                        style={{
                            margin: margin.big
                        }}
                        size="large"
                        color={colors.background} />
                </View>
            </View >
        );
    }
}

export default Add;