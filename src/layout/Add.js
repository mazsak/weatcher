import React, { Component } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Button
} from 'react-native';
import API from '../API';
import { Searchbar } from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import dimens from '../dimenssion';

const size = dimens.size;
const margin = dimens.margin;

const api = new API()

class Add extends Component {
    constructor(props) {
        super(props);
        this.state = {
            search: ""
        }
    }


    render() {
        return (
            <View>
                <Searchbar
                    placeholder="Search city..."
                    onChangeText={city => {
                        this.setState({
                            search: city
                        });
                        console.log(city);
                    }}
                    value={this.state.search}
                    icon={() =>
                        <AntDesign name="arrowleft" color='blac' size={size.smallBig}/>
                    }
                    onIconPress={()=>this.props.navigation.goBack()}
                />
                <Button 
                title="Your location"
                style={{
                    margin: margin.small
                }}
                />
                <FlatList

                />
            </View>
        );
    }
}

export default Add;