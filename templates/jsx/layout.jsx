const React = require('react');

const Layout = (props) => (
  <html>
    <head>
      <title>{props.title}</title>
      <link rel="stylesheet" href="/stylesheets/style.css"/>
    </head>
    <body>{props.children}</body>
  </html>);

module.exports = Layout;
