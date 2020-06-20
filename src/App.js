import React from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Home from "./layout/Home";
import Add from "./layout/Add";


const App = createStackNavigator({
  Home: {
    screen: Home,
    navigationOptions: {
      headerShown:false
    }
  },
  Add:{
    screen: Add,
    navigationOptions: {
      headerShown:false
    }
  }
});

export default createAppContainer(App);
