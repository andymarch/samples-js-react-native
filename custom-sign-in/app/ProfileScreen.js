/*
 * Copyright (c) 2019-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Button
} from 'react-native';
import { getAccessToken, getUser, clearTokens, revokeAccessToken, introspectAccessToken, refreshTokens, revokeRefreshToken, introspectRefreshToken } from '@okta/okta-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Error from './components/Error';
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://7827431b90674089abbbb8bba5fca65e@o876653.ingest.sentry.io/5826359",
});

export default class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      accessToken: null,
      user: null,
      progress: true,
      error: '',
      message: ''
    };

    this.logout = this.logout.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
  }

  componentDidMount() {
    this.props.navigation.setOptions({
      headerLeft: () => 
        <Text onPress={this.logout} style={styles.logoutButton}>Logout</Text>
    });

    this.setState({ progress: true });
    getUser()
      .then(user => {
        this.setState({ progress: false, user });
      })
      .catch(e => {
        console.log(JSON.stringify(e))
        this.setState({ progress: false, error: e.message, message: JSON.stringify(e) });
      });
  }

  getAccessToken() {
    this.setState({ progress: false });
    getAccessToken()
      .then(token => {
        this.setState({
          progress: false,
          accessToken: token.access_token
        });
      })
      .catch(e => {
        Sentry.captureException(err);
        this.addHistory(JSON.stringify(e))
        this.setState({ progress: false, error: e.message, message: JSON.stringify(e) });
      });
  }

  introspectAccessToken = () => {
    introspectAccessToken()
      .then(response => {
        this.setState({ progress: false, message: "instropection passed" });
      })
      .catch(e => {
        Sentry.captureException(err);
        console.log(e)
        this.setState({ progress: false, error: e.message, message: JSON.stringify(e) });
      });
  }

  revokeAccessToken= () => {
    revokeAccessToken()
      .then(result =>{
        this.setState({ progress: false, message: "access token revoked" });
      })
      .catch(e => {
        Sentry.captureException(err);
        console.log(e)
        this.setState({ progress: false, error: e.message, message: JSON.stringify(e) });
      });
  }

  refreshTokens= () => {
    console.log("refreshing tokens")
    refreshTokens()
      .then(tokens => {
       console.log(tokens)
       this.setState({ progress: false, message: "tokens refreshed", accessToken: tokens.access_token });
      })
      .catch(e => {
        Sentry.captureException(err);
        console.log(e)
        this.setState({ progress: false, error: e.message,message: JSON.stringify(e) });
      });
  }

  introspectRefreshToken = () => {
    introspectRefreshToken()
      .then(response => {
        console.log(response)
        this.setState({ progress: false, message: "refresh instropection passed" });
      })
      .catch(e => {
        Sentry.captureException(err);
        console.log(e)
        this.setState({ progress: false, error: e.message, message: JSON.stringify(e) });
      });
  }

  revokeRefreshTokens= () => {
    revokeRefreshToken()
      .then(response => {
        Sentry.captureException(err);
        console.log(response)
        this.setState({ progress: false, message: "refresh token revoked" });
      })
  }

  logout() {
    clearTokens()
      .then(() => {
        this.props.navigation.navigate('Login');
      })
      .catch(e => {
        Sentry.captureException(err);
        this.setState({ error: e.message });
      });
  }

  render() {
    const { user, accessToken, error, progress, message} = this.state;

    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container}>
          <Spinner
            visible={progress}
            textContent={'Loading...'}
            textStyle={styles.spinnerTextStyle}
          />
          <Error error={error} />
          <Text>{message}</Text>
          { user && (
            <View style={{ paddingLeft: 20, paddingTop: 20 }}>
              <Text style={styles.titleHello}>Hello {user.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text testID="nameTitleLabel">Name: </Text>
                <Text>{user.name}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text testID="localeTitleLabel">Locale: </Text>
                <Text>{user.locale}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text testID="timeZoneTitleLabel">Zone Info: </Text>
                <Text>{user.zoneinfo}</Text>
              </View>
            </View>
          )}
          <View style={{ flexDirection: 'column', marginTop: 20, paddingLeft: 20, width: 300 }}>
            <Button testID="accessButton" style={{ marginTop:40 }} title="Show access token" onPress={this.getAccessToken} />
            { accessToken &&
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenTitle}>Access Token:</Text>
                <Text style={{ marginTop: 20 }} numberOfLines={5}>{accessToken}</Text>
                <Button testID="introspectAT" style={{ marginTop:40 }} title="Introspect token" onPress={this.introspectAccessToken} />
                <Button testID="revokeAT" style={{ marginTop:40 }} title="Revoke token" onPress={this.revokeAccessToken} />
              </View>
            }
          </View>
          <View style={{ flexDirection: 'column', marginTop: 20, paddingLeft: 20, width: 300 }}>
            <Button testID="refreshTokens" style={{ marginTop:40 }} title="Refresh tokens" onPress={this.refreshTokens} />
            <Button testID="introspectRefreshTokens" style={{ marginTop:40 }} title="Introspect Refresh tokens" onPress={this.introspectRefreshToken} />
            <Button testID="revokerefreshTokens" style={{ marginTop:40 }} title="Revoke Refresh tokens" onPress={this.revokeRefreshTokens} />
          </View>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF',
  },
  button: {
    borderRadius: 40,
    width: 200,
    height: 40,
    marginTop: 40,
    marginBottom: 10,
    marginHorizontal: 10,
  },
  logoutButton: {
    paddingLeft: 10,
    fontSize: 16,
    color: '#0066cc'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  titleHello: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
    paddingTop: 40
  },
  titleDetails: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingTop: 15,
    textAlign: 'center',
  },
  tokenContainer: {
    marginTop: 20
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});
