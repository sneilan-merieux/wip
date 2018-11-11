import * as React from 'react';
import * as style from 'styled-components';
import Debug from 'debug';
import DomInspector from '../inspector';
import Vcr from '../Vcr';
import { Root, Name } from './elements';
import * as FileSaver from 'file-saver';

const debug = Debug('vcr:client');

const GlobalStyle = (style as any).createGlobalStyle`
  html, body {
    padding: 0;
    margin: 0;
  }
`;

interface ToolbarProps {
  vcr: Vcr;
}

export default class Toolbar extends React.Component<ToolbarProps> {
  state = {
    installing: true,
    isRecording: false,
    hasCassette: false,
  }

  async componentDidMount() {
    await this.props.vcr.install()
    this.setState({ installing: false });
  }

  handleRecord = () => {
    debug('Start recording');
    this.setState({ installing: false, isRecording: true });
    this.props.vcr.record();
  }

  handleStop = () => {
    this.setState({ isRecording: false, hasCassette: true });
    this.props.vcr.stop();
  }

  handleSnapshot = () => {
    const inspector = new DomInspector({
      contentWindow: this.props.vcr.iframe.contentWindow
    });
    inspector.onClick((e) => {
      e.preventDefault();
      this.props.vcr.recordSnapshotEvent(e);
      inspector.destroy();
    });
    inspector.enable();
  }

  handleSave = () => {
    const blob = new Blob([JSON.stringify(this.props.vcr.cassette.dump(), null, 2)], { type: "application/json;charset=utf-8" });
    FileSaver.saveAs(blob, "untitled.vc");
  }

  render() {
    const { installing, isRecording, hasCassette } = this.state;
    return (
      <Root>
        <GlobalStyle />
        <Name>VCR</Name>
        {installing ? <div>Installing</div> : (
          isRecording ? (
            <>
              <button onClick={this.handleStop}>Stop</button>
              <button onClick={this.handleSnapshot}>Snapshot</button>
            </>
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
