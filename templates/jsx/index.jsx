const React = require('react');
const Layout = require('./layout')

const Index = props => (
  <Layout title={props.title}>
    <h1>{props.title}</h1>
    <p>Welcome to {props.title}</p>
  </Layout>
);

module.exports = Index;
