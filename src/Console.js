import React, { Component } from 'react';
import CallCacheDiff from './CallCacheDiff'
import Metadata from './Metadata'
import OperationIds from './OperationIds'
import Tabs from './layout/Tabs'

class Console extends Component {
  constructor(props) {
    super(props);
    this.state = {
      config: {},
      token: '',
      error: ''
    };
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  getConfig() {
    try {
      return fetch('config.json').then( body => body.json());
    } catch(error) {
      this.handleError(null, error)
    }
  }

  componentDidMount() {
    try {
      this.getConfig()
        .then((config) => {
          this.setState({
            config: config
          });
        })
    } catch (error) {
      this.handleError(null, error)
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
        <div className={this.state.error ? 'error' : 'hide'}>{this.state.error}</div>
        <div className="token-header">
          <form>
            <div className="form-field">
              <label htmlFor="token">Auth token</label>
              <textarea
                name="token"
                defaultValue={this.state.token}
                onChange={this.handleInputChange}
                id="token"
                rows="3"
              />
            </div>
          </form>
        </div>
        <Tabs>
          <div label="Metadata">
            <Metadata
              config={this.state.config}
              token={this.state.token}
              handleError={this.handleError}
            />
          </div>
          <div label="Callcache">
            <CallCacheDiff
              config={this.state.config}
              token={this.state.token}
              handleError={this.handleError}
            />
          </div>
          <div label="Operation ID(s)">
            <OperationIds
              config={this.state.config}
              token={this.state.token}
              handleError={this.handleError}
            />
          </div>
        </Tabs>
      </div>
    )
  }
}

export default Console;
