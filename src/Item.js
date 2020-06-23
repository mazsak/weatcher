import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    Button,
    ToastAndroid,
    Alert
} from 'react-native';
import dimens from './dimenssion';
import colors from './colors';
import API from './API';
import db from './database';


const size = dimens.size;
const margin = dimens.margin;

const api = new API()

class Item extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: this.props.item.city.name,
            country: this.props.item.city.country,
            icon: this.props.item.list[0].weather[0].icon,
            description: this.props.item.list[0].weather[0].description,
            dataCity: this.props.item.city
        };
    }

    componentDidUpdate(preProps) {
        if (preProps !== this.props) {
            this.setState({
                name: this.props.item.city.name,
                country: this.props.item.city.country,
                icon: this.props.item.list[0].weather[0].icon,
                description: this.props.item.list[0].weather[0].description,
                dataCity: this.props.item.city
            });
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
            <TouchableOpacity
                onPress={() =>
                    Alert.alert(
                        "Information",
                        "Are you sure you want to add the city?",
                        [
                            {
                                text: 'Yes',
                                onPress: () => {
                                    this.addCity(this.state.dataCity)
                                }
                            },
                            {
                                text: 'No',
                                style: 'cancel'
                            }
                        ],
                        { cancelable: false }
                    )
                }
            >
                <View
                    style={{
                        justifyContent: 'center',
                        flexDirection: 'column',
                        backgroundColor: colors.background,
                        marginTop: margin.small,
                        paddingLeft: margin.small
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row'
                        }}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: size.mediumBig,
                                padding: margin.verySmall
                            }}
                        >
                            {this.state.name}, {this.state.country}
                        </Text>
                    </View>
                    <View
                        style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            padding: margin.verySmall
                        }}
                    >
                        <Image
                            style={{
                                width: size.big,
                                height: size.big
                            }}
                            source={{
                                uri: api.getIcon(this.state.icon)
                            }}
                        />
                        <Text
                            style={{
                                color: colors.text,
                                fontSize: size.medium
                            }}
                        >
                            {this.state.description.replace(this.state.description[0], this.state.description[0].toUpperCase())}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

export default Item;