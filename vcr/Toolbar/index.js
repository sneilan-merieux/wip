import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Debug from 'debug';
import Vcr from '../Vcr';
import { Root, Name } from './elements';
import FileSaver from 'file-saver';

const debug = Debug('vcr:client');

const GlobalStyle = createGlobalStyle`
  html, body {
    padding: 0;
    margin: 0;
  }
`;

const key = 'vcr.recording';

export default class Toolbar extends React.Component {
  state = {
    installing: true,
    isRecording: window.sessionStorage.getItem(key) === 'true',
    hasCassette: false,
  }

  constructor(props) {
    super(props);

    this.iframe = document.getElementById('iframe');
    this.vcr = new Vcr(this.iframe);
  }

  async componentDidMount() {
    await this.vcr.install()
    this.setState({ installing: false });
    await this.loadIframe();
    if (this.state.isRecording) {
      this.vcr.record();
    }
  }

  loadIframe() {
    return new Promise((resolve) => {
      const contentPage = window.location.pathname.substr('/vcr'.length) + window.location.search;
      this.iframe.src = contentPage + window.location.hash;
      debug('Loading page %s', this.iframe.src);
      this.iframe.onload = resolve;
    });
  }

  handleRecord = () => {
    window.sessionStorage.setItem(key, true);
    this.setState({ installing: false });
    window.location.reload();
  }

  handleStop = () => {
    window.sessionStorage.setItem(key, false);
    this.setState({ isRecording: false, hasCassette: true });
    this.vcr.stop();
  }

  handleSave = () => {
    const blob = new Blob([JSON.stringify(this.vcr.cassette.dump(), null, 2)], { type: "application/json;charset=utf-8" });
    FileSaver.saveAs(blob, "untitled.json");
  }

  render() {
    const { installing, isRecording, hasCassette } = this.state;

    return (
      <Root>
        <GlobalStyle />
        <Name>VCR</Name>
        {installing ? <div>Installing</div> : (
          isRecording ? (
            <button onClick={this.handleStop}>Stop</button>
          ) : (
            <button onClick={this.handleRecord}>Record</button>
          )
        )}
        {hasCassette && (
          <button onClick={this.handleSave}>Save</button>
        )}
     </Root>
    );
  }
}
