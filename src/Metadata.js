import React, { Component } from 'react';
import ReactJson from 'react-json-view';

class Metadata extends Component {
  constructor(props) {
    super(props);
    this.state = {
      metadata: {},
      workflowId: ''
    };
    this.makeCall = this.makeCall.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  makeCall (event) {
    const { workflowId } = this.state;
    if (this.props.token && this.props.config && this.props.config.orchestrationUrlRoot && workflowId) {
      let url = new URL(`${this.props.config.orchestrationUrlRoot}/api/workflows/v1/${workflowId}/metadata`)
      fetch(url, {
        method: 'get',
        headers: new Headers({
          'Authorization': `Bearer ${this.props.token}`,
          'Accept': 'application/json'
        })
      })
        .then(res => {
          if (res.status === 200) {
            return res.json()
          } else {
            this.props.handleError('there was an error getting metadata')
          }
        })
        .then(
          (result) => {
            this.setState({
              metadata: result
            });
          },
          (error) => {
            this.props.handleError('there was an error getting metadata: ' + error)
          }
        )
    } else if (!workflowId) {
      alert('You must provide a workflow ID.');
    } else if (!this.props.config && this.props.config.orchestrationUrlRoot) {
      alert('There is no endpoint defined in the config file.');
    } else if (!this.props.token) {
      alert('You must set an auth token first.');
    }
    event.preventDefault();
  }

  render() {
    const { workflowId, metadata } = this.state;
    return (
      <div className="feature-container">
        <form>
          <div className="form-field">
            <label htmlFor="workflowId">Workflow (job) ID</label>
            <input
              type="text"
              name="workflowId"
              defaultValue={workflowId}
              onChange={this.handleInputChange}
              id="workflowId" />
          </div>
          <div className="button-container">
            <button type="submit" onClick={this.makeCall}>Get Metadata</button>
          </div>
        </form>
        <div className={metadata.workflowName ? 'show-json' : 'hide'}><ReactJson
          src={metadata}
          collapsed={false}
          collapseStringsAfterLength={180}
          displayDataTypes={false}
        /></div>
      </div>
    )
  }
}

export default Metadata;
