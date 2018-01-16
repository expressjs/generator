const React = require('react');

const Error = (props) => (
  <React.Fragment>
    <h1>{props.message}</h1>
    <h2>{props.error.status}</h2>
    <pre>{props.error.stack}</pre>
  </React.Fragment>);

module.exports = Error;
