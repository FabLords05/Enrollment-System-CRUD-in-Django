/**
 * index.ts ─ CLEAN ENTRY POINT FOR EXPO SDK 54
 * Replace the contents of mobile/index.ts with this:
 */

import { registerRootComponent } from 'expo';
import App from './src/App';

// registerRootComponent automatically manages environment side-effects and initial setups
registerRootComponent(App);