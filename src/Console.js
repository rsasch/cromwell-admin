import React, { Component } from 'react'
import CallCacheDiff from './CallCacheDiff'
import Tabs from './layout/Tabs'
import Metadata from './Metadata'
import OperationIds from './OperationIds'


class SignInButton extends Component {
  componentDidMount() {
    window.gapi.signin2.render('signInButton', {
      scope: 'openid profile email',
      height: 20,
      longtitle: true,
      theme: 'light',
      prompt: 'select_account'
    })
  }

  render() {
    return <div id="signInButton" />
  }
}

class Console extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {},
      error: ''
    };
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleError = this.handleError.bind(this)
    this.signOut = this.signOut.bind(this)
  }

  getConfig() {
    try {
      return fetch('config.json').then( body => body.json());
    } catch(error) {
      this.handleError(null, error)
    }
  }

  async componentDidMount() {
    try {
      const config = await this.getConfig()
      this.setState({ config });
      await new Promise(resolve => window.gapi.load('auth2', resolve))
      await window.gapi.auth2.init({ clientId: config.googleClientId })
      this.setState({ signInReady: true, isSignedIn: window.gapi.auth2.getAuthInstance().currentUser.get().isSignedIn() })

      window.gapi.auth2.getAuthInstance().currentUser.listen((user) => {
        this.setState({
          isSignedIn: user.isSignedIn()
        })
      })
    } catch (error) {
      this.handleError(null, error)
    }
  }

  signOut() {
    if (this.state.isSignedIn) {
      window.gapi.auth2.getAuthInstance().signOut()
    }
  }

  handleError(code, message) {
    if (code === 401) {
      message += ' [token might be expired]'
    } else if (code === 404) {
      message += ' [not found]'
    }
    this.setState({
      error: message
    })
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  render() {
    return (
      <div className="console-container">
        <div className={this.state.error ? 'error' : 'hide'}>{JSON.stringify(this.state.error)}</div>
        <div className="auth-header">
          {!this.state.isSignedIn && this.state.signInReady && <div><SignInButton /></div>}
          {this.state.isSignedIn &&  <button onClick={this.signOut} className="sign-out">sign out</button>}
      </div>
        {this.state.isSignedIn && <Tabs>
          <div label="Metadata">
            <Metadata
              config={this.state.config}
              handleError={this.handleError}
            />
          </div>
          <div label="Callcache">
            <CallCacheDiff
              config={this.state.config}
              handleError={this.handleError}
            />
          </div>
          <div label="Operation ID(s)">
            <OperationIds
              config={this.state.config}
              handleError={this.handleError}
            />
          </div>
        </Tabs>}
      </div>
    )
  }
}

export default Console;
