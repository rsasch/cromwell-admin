import React, { Component } from 'react';
import Spinner from './layout/Spinner'

class OperationIds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workflowId: '',
      call: '',
      index: '',
      attempt: '',
      displayWorkflowName: true,
      displayCall: true,
      displayIndex: true,
      displayAttempt: true,
      isLoading: false,
      operationIds: []
    };
    this.makeCall = this.makeCall.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.id;

    this.setState({
      [name]: value
    });
  }

  makeCall (event) {
    if (window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token && this.props.config && this.props.config.orchestrationUrlRoot && this.state.workflowId) {
      this.setState({
        isLoading: true
      });
      let url = new URL(`${this.props.config.orchestrationUrlRoot}/api/workflows/v1/${this.state.workflowId}/metadata`)
      url.search = new URLSearchParams({
        'includeKey' : 'jobId'
      }).toString();
      fetch(url, {
        method: 'get',
        headers: new Headers({
          'Authorization': `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token}`,
          'Accept': 'application/json'
        })
      })
        .then(res => {
          if (res.status === 200) {
            // this.props.clearError()
            return res.json()
          } else {
            this.setState({
              isLoading: false
            });
            this.props.handleError(res.status, 'there was an error getting metadata')
          }
        })
        .then(
          (result) => {
            if (result && result.calls) {
              let ids = []
              for (let callName in result.calls) {
                result.calls[callName].forEach((attempt) => {
                  if (
                    (!this.state.call || (this.state.call === callName.split('.')[1])) &&
                    (!this.state.index || (this.state.index === attempt.shardIndex.toString())) &&
                    (!this.state.attempt || (this.state.attempt === attempt.attempt.toString()))
                  ) {
                    ids.push({
                      'call' : callName.split('.')[1],
                      'index' : attempt.shardIndex === -1 ? '' : attempt.shardIndex,
                      'attempt' : attempt.attempt,
                      'operationId' : attempt.jobId
                    })
                  }
                });
              }
              this.setState({
                operationIds: ids,
                isLoading: false
              });
            }
            this.setState({
              isLoading: false
            });
          },
          (error) => {
            this.setState({
              isLoading: false
            });
            this.props.handleError(null, 'there was an error getting metadata: ' + error);
          }
        )
    } else if (!this.props.config && this.props.config.orchestrationUrlRoot) {
      alert('There is no endpoint defined in the config file.');
    } else if (!window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token) {
      alert('You must set an auth token first.');
    } else if (!this.state.workflowId) {
      alert('You must provide a workflow ID.');
    }
    event.preventDefault();
  }

  render() {
    return (
      <div className="feature-container">
        <form>
          <div className="headnote">Fields in <span className="required"> bold</span> are required.</div>
          <fieldset>
            <legend>Search</legend>
            <div className="form-field">
              <label htmlFor="workflowA" className="required">Workflow (job) ID</label>
              <input
                type="text"
                id="workflowId"
                defaultValue={this.state.workflowId}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="call">Call (task) Name</label>
              <input
                type="text"
                id="call"
                defaultValue={this.state.call}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="index">Index (scattered task shard) Number*</label>
              <input
                type="text"
                id="index"
                defaultValue={this.state.index}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="attempt">Attempt Number</label>
              <input
                type="text"
                id="attempt"
                defaultValue={this.state.attempt}
                onChange={this.handleInputChange}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>Display</legend>
            <div className="form-field">
              <input
                type="checkbox"
                id="displayCall"
                checked={this.state.displayCall}
                onChange={this.handleInputChange}
              />
              <label htmlFor="displayCall">Call (task) Name</label>
            </div>
            <div className="form-field">
              <input
                type="checkbox"
                id="displayIndex"
                checked={this.state.displayIndex}
                onChange={this.handleInputChange}
              />
              <label htmlFor="displayIndex">Shard Number</label>
            </div>
            <div className="form-field">
              <input
                type="checkbox"
                id="displayAttempt"
                checked={this.state.displayAttempt}
                onChange={this.handleInputChange}
              />
              <label htmlFor="displayAttempt">Attempt Number</label>
            </div>
          </fieldset>
          <div className="footnote">* if the call/task is scattered, the specific shard you wish to retrieve (starting at 0)</div>
          <div className="button-container">
            <button type="submit" onClick={this.makeCall}>Get Operation ID(s)</button>
          </div>
        </form>
        <div className={this.state.isLoading ? 'loading' : 'hide'}>
          <Spinner loading={this.state.isLoading} />
        </div>
        <div className={!this.state.isLoading && this.state.operationIds.length ? 'operation-ids' : 'hide'}>
          <table>
            <thead>
              <tr>
                { this.state.displayCall &&  <th>Call/Task</th> }
                { this.state.displayIndex && <th>Shard Number</th> }
                { this.state.displayAttempt && <th>Attempt Number</th> }
                <th>Operation ID</th>
              </tr>
            </thead>
            <tbody>
            {
              this.state.operationIds.map((row, num) => {
                return (
                  <tr key={num}>
                    { this.state.displayCall && <td>{row.call}</td> }
                    { this.state.displayIndex && <td>{row.index}</td> }
                    { this.state.displayAttempt && <td>{row.attempt}</td> }
                    <td>{row.operationId}</td>
                  </tr>
                )
              })
            }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default OperationIds;
