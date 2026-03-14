/**
 * Live Voice – entry point
 *
 * This file is loaded by React Native's bundler.
 * See src/services/ for the core business logic and
 * src/__tests__/ for the test suite.
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

AppRegistry.registerComponent(appName, () => App);
