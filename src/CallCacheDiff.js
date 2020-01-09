import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import Spinner from './layout/Spinner'

class CallCacheDiff extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workflowA: '',
      workflowB: '',
      call1A: '',
      call2A: '',
      indexA: '',
      call1B: '',
      call2B: '',
      indexB: '',
      callCacheDiff: {},
      isLoading: false
    };
    this.makeCall = this.makeCall.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.copyFieldValue = this.copyFieldValue.bind(this)
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
    this.setState({
      isLoading: false
    });
    if (window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token && this.props.config && this.props.config.orchestrationUrlRoot) {
      this.setState({
        isLoading: true
      });
      let url = new URL(`${this.props.config.orchestrationUrlRoot}/api/workflows/v1/callcaching/diff`);
      let fields = {
        workflowA: this.state.workflowA,
        workflowB: this.state.workflowB,
        callA: this.state.call1A + '.' + this.state.call2A,
        callB: this.state.call1B + '.' + this.state.call2B
      };
      if (this.state.indexA && this.state.indexB) {
        fields.indexA = this.state.indexA;
        fields.indexB = this.state.indexB;
      }
      url.search = new URLSearchParams(fields).toString();

      fetch(url, {
        method: 'get',
        headers: new Headers({
          'Authorization': `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token}`,
          'Accept': 'application/json'
        })
      })
        .then(res => {
          if (res.status === 200) {
            this.props.handleError('')
            return res.json()
          } else {
            this.setState({
              isLoading: false
            });
            this.props.handleError(res.status, 'there was an error getting call cache diff')
          }
        })
        .then(
          (result) => {
            this.setState({
              isLoading: false
            });
            this.setState({
              callCacheDiff: result
            });
          },
          (error) => {
            this.setState({
              isLoading: false
            });
            this.props.handleError(null, 'there was an error getting call cache diff: ' + error)
          }
        )
    } else if (!this.props.config && this.props.config.orchestrationUrlRoot) {
      alert('There is no endpoint defined in the config file.');
    }else if (!window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true).access_token) {
      alert('You must set an auth token first.');
    }
    event.preventDefault();
  }

  copyFieldValue(event) {
    const id = event.target.id
    const fieldA = document.getElementById(id + 'A')
    const fieldB = document.getElementById(id + 'B')
    if (event.target.checked && fieldA && fieldA.value) {
      fieldB.value = fieldA.value
      this.setState({
        [id + 'B']: fieldA.value
      })
    } else {
      fieldB.value = ''
      this.setState({
        [id + 'B']: ''
      })
    }
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
              <input
                type="text"
                id="workflowA"
                defaultValue={this.state.workflowA}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="call1A" className="required">Workflow Name</label>
              <input
                type="text"
                id="call1A"
                defaultValue={this.state.call1A}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="call2A" className="required">Call (task) Name</label>
              <input
                type="text"
                id="call2A"
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
              <input
                type="text"
                id="workflowB"
                defaultValue={this.state.workflowB}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="call1B" className="required">
                Workflow Name<br />
                <input
                  type="checkbox"
                  id="call1"
                  onClick={this.copyFieldValue}
                />
                <label htmlFor="call1">same as #1</label>
              </label>
              <input
                type="text"
                id="call1B"
                defaultValue={this.state.call1B}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="call2B" className="required">
                Call (task) Name<br />
                <input
                  type="checkbox"
                  id="call2"
                  onClick={this.copyFieldValue}
                />
                <label htmlFor="call2">same as #1</label>
              </label>
              <input
                type="text"
                id="call2B"
                defaultValue={this.state.call2B}
                onChange={this.handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="indexB">Index (scattered task shard) Number*<br />
                <input
                  type="checkbox"
                  id="index"
                  onClick={this.copyFieldValue}
                />
                <label htmlFor="index">same as #1</label>
              </label>
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
        <div className={this.state.isLoading ? 'loading' : 'hide'}>
          <Spinner loading={this.state.isLoading} />
        </div>
        <div className={!this.state.isLoading && this.state.callCacheDiff && this.state.callCacheDiff.callA ? 'show-json' : 'hide'}>
          <ReactJson
            src={this.state.callCacheDiff}
            collapsed={false}
            collapseStringsAfterLength={180}
            displayDataTypes={false}
            shouldCollapse={({ namespace }) =>
              namespace.indexOf("callA") > -1 ||
              namespace.indexOf("callB") > -1
            }
          /></div>
      </div>
    )
  }
}

export default CallCacheDiff;
