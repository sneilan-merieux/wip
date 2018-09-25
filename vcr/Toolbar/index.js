import React from 'react';
import { createGlobalStyle } from 'styled-components';
import Vcr from '../Vcr';
import { Root, Name } from './elements';

const GlobalStyle = createGlobalStyle`
  body {
    padding-top: 30px;
  }
`;

const key = 'vcr.recording';

export default class Toolbar extends React.Component {
  state = {
    installing: true,
  }

  constructor(props) {
    super(props);

    this.vcr = new Vcr();
  }

  async componentDidMount() {
    await this.vcr.install()
    this.setState({ installing: false });
    if (this.isRecording()) {
      this.vcr.record();
    }
  }

  isRecording() {
    return window.sessionStorage.getItem(key) === 'true';
  }

  handleRecord = () => {
    window.sessionStorage.setItem(key, true);
    this.setState({ installing: false });
    window.location.reload();
  }

  handleStop = () => {
    window.sessionStorage.setItem(key, false);
    this.vcr.stop();
    window.location.reload();
  }

  render() {
    const { installing } = this.state;

    return (
      <Root>
        <GlobalStyle />
        <Name>VCR</Name>
        {installing ? <div>Installing</div> : (
          this.isRecording() ? (
            <button onClick={this.handleStop}>Stop</button>
          ) : (
            <button onClick={this.handleRecord}>Record</button>
          )
        )}
     </Root>
    );
  }
}
