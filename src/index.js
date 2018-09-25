import React from 'react';
import { render } from 'react-dom';

class App extends React.Component {
  state = {
    user: null,
  };

  componentDidMount() {
    this.fetchUser();
  }

  fetchUser = () => {
    fetch('https://randomuser.me/api/')
      .then(response  => response.json())
      .then(({ results }) => this.setState({ user: results[0] }))
      .catch(e => console.error());
  }

  render() {
    const { user } = this.state;
    return user && (
      <div>
        <img src={user.picture.medium} />
        <button onClick={this.fetchUser}>Next</button>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
