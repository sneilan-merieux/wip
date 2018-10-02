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
    isRecording: false,
    hasCassette: false,
  }

  constructor(props) {
    super(props);

    this.vcr = new Vcr();
  }

  async componentDidMount() {
    await this.vcr.install()
    this.setState({ installing: false });
  }

  handleRecord = () => {
    debug('Start recording');
    this.setState({ installing: false, isRecording: true });
    this.vcr.record();
  }

  handleStop = () => {
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
