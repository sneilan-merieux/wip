import React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';

const Container = styled.div`
  width: 800px;
  margin: 200px auto 0 auto;
  font-size: 14px;
`;

const Input = styled.input`
  padding: 4px 11px;
  width: 100%;
  height: 32px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const Profile = styled.div`
  ul {
    list-style: none;
    padding: 0;
  }
`;

class App extends React.Component {
  state = {
    username: '',
    user: null,
    notFound: false,
  };

  fetchUser = () => {
    const { username } = this.state;
    fetch(`https://api.github.com/users/${username}`)
      .then(response  => {
        if (response.status === 404) {
          throw new Error("404 NOT FOUND")
        }
        return response.json()
      })
      .then(user => this.setState({ user }))
      .catch(e => this.setState({ user: null, notFound: true }));
  }

  handleChange = (e) => {
    this.setState({ username: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.fetchUser();
    this.setState({ username: '' });
  }

  render() {
    const { username, user, notFound } = this.state;
    return (
      <Container>
        <form onSubmit={this.handleSubmit}>
          <Input value={username} onChange={this.handleChange} placeholder="GitHub username" />
        </form>
        {user && (
          <Profile>
            <img src={user.avatar_url} width="230" />
            <ul>
              <li>{user.name}</li>
              <li>{user.login}</li>
              {user.company && <li>{user.company}</li>}
              {user.location && <li>{user.location}</li>}
              {user.blog && <li><a href={user.blog}>{user.blog}</a></li>}
            </ul>
          </Profile>
        )}
        {notFound && <div>Not found!</div>}
      </Container>
    );
  }
}

render(<App />, document.getElementById('root'));
