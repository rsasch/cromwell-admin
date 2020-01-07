import React, { Component } from 'react';

class CallCacheDiff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workflowA: '',
      workflowB: '',
      callA1: '',
      callA2: '',
      indexA: '',
      callB1: '',
      callB2: '',
      indexB: '',
      callCacheDiff: {}
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
    if (this.props.token && this.props.config && this.props.config.orchestrationUrlRoot) {
      let url = new URL(`${this.props.config.orchestrationUrlRoot}/api/workflows/v1/callcaching/diff`);
      url.search = new URLSearchParams({
        workflowA: this.state.workflowA,
        workflowB: this.state.workflowB,
        callA: this.state.callA1 + '.' + this.state.callA2,
        // indexA: this.state.indexA ? this.state.indexA : null,
        callB: this.state.callB1 + '.' + this.state.callB2,
        // indexB: this.state.indexB ? this.state.indexB : null
      }).toString();

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
            this.props.handleError('there was an error getting call cache diff')
          }
        })
        .then(
          (result) => {
            this.setState({
              callCacheDiff: result
            });
          },
          (error) => {
            this.props.handleError('there was an error getting call cache diff: ' + error)
          }
        )
    } else if (!this.props.config && this.props.config.orchestrationUrlRoot) {
      alert('There is no endpoint defined in the config file.');
    }else if (!this.props.token) {
      alert('You must set an auth token first.');
    }
    event.preventDefault();
  }

  render() {
    return (
      <div className="feature-container">
        <form>
          <div className="headnote">Fields in <span className="required"> bold</span> are required.</div>
          <fieldset>
            <legend>Call #1</legend>
            <div className="form-field">
              <label htmlFor="workflowA" className="required">Workflow (job) ID</label>
              <textarea
                id="workflowA"
                defaultValue={this.state.workflowA}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="callA1" className="required">Workflow Name</label>
              <input
                type="text"
                id="callA1"
                defaultValue={this.state.callA1}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="callA2" className="required">Call (task) Name</label>
              <input
                type="text"
                id="callA2"
                defaultValue={this.state.callA2}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="indexA">Index (scattered task shard) Number*</label>
              <input
                type="text"
                id="indexA"
                defaultValue={this.state.indexA}
                onChange={this.handleInputChange}
              />
            </div>
          </fieldset>
          <fieldset>
            <legend>Call #2</legend>
            <div className="form-field">
              <label htmlFor="workflowB" className="required">Workflow (job) ID</label>
              <textarea
                id="workflowB"
                defaultValue={this.state.workflowB}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="callB1" className="required">Workflow Name</label>
              <input
                type="text"
                id="callB1"
                defaultValue={this.state.callB1}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="callB2" className="required">Call (task) Name</label>
              <input
                type="text"
                id="callB2"
                defaultValue={this.state.callB2}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="indexB">Index (scattered task shard) Number*</label>
              <input
                type="text"
                id="indexB"
                defaultValue={this.state.indexB}
                onChange={this.handleInputChange}
              />
            </div>
          </fieldset>
          <div className="footnote">* If the call/task is scattered you must fill this in with the specific shard you wish to compare (starting at 0). If it isn't scattered and you fill this in with anything (even -1) you won't get results.</div>
          <div className="button-container">
            <button type="submit" onClick={this.makeCall}>Get Call Cache Diff</button>
          </div>
        </form>
        <div className={this.state.callCacheDiff.hashDifferential ? 'callcachediff' : 'hide'}>{JSON.stringify(this.state.callCacheDiff.hashDifferential)}</div>
      </div>
    )
  }
}

export default CallCacheDiff;
