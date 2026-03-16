/**
 * Mock for react-native-maps
 */

import React from 'react';
import {View} from 'react-native';

const MockMapView = ({children, onMapReady, ...props}) => {
  if (onMapReady) {
    setTimeout(onMapReady, 0);
  }
  return React.createElement(View, props, children);
};
MockMapView.Animated = MockMapView;

const MockUrlTile = props => React.createElement(View, props);
const MockPolyline = props => React.createElement(View, props);
const MockCircle = props => React.createElement(View, props);
const MockMarker = ({children, ...props}) =>
  React.createElement(View, props, children);
const MockCallout = ({children, ...props}) =>
  React.createElement(View, props, children);

module.exports = MockMapView;
module.exports.default = MockMapView;
module.exports.UrlTile = MockUrlTile;
module.exports.Polyline = MockPolyline;
module.exports.Circle = MockCircle;
module.exports.Marker = MockMarker;
module.exports.Callout = MockCallout;
