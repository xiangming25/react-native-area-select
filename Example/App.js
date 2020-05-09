/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, Alert} from 'react-native';
import AreaSelect from 'react-native-area-select'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

export default class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      place: '',
    }
  }
  render() {
    const { place } = this.state
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.btn} onPress={this.openAreaSelect}>
          <Text style={styles.btnText}>{place || '请选择所在地区'}</Text>
        </TouchableOpacity>
        <AreaSelect
          ref={refs => (this.areaSelectRef = refs)}
          initShow={false}
          place={place}
          activeColor="#f11c0a"
          onFinished={this.handleSelectSuccess}
        />
      </View>
    );
  }

  openAreaSelect = () => {
    this.areaSelectRef && this.areaSelectRef.show()
  }

  handleSelectSuccess = (newPlace) => {
    this.setState({ place: newPlace })
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  btn: {
    width: 375,
    marginTop: 100,
    padding: 15,
    justifyContent: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: '#eeeeee',
    borderBottomColor: '#eeeeee',
  },
  btnText: {
    fontSize: 16,
    color: '#333333',
  },
});
