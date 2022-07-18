import React, { Component } from 'react';

class App extends Component {
  constructor(props: any) {
    super(props);

    console.log('constructor');
  }

  componentDidMount() {
    console.log('componentDidMount');
  }

  componentWillUnmount() {
    console.log('componentWillUnmount');
  }

  componentDidUpdate() {
    console.log('componentDidUpdate');
  }

  render = () => {
    console.log('render');

    return <div>App</div>;
  };
}

export default () => <App />;
