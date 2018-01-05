const React = require('react');

const Index = props => (
  <React.Fragment>
    <h1>{props.title}</h1>
    <p>Welcome to {props.title}</p>
  </React.Fragment>
);

module.exports = Index;
