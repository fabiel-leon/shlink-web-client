import ReduxThunk from 'redux-thunk';
import { applyMiddleware, compose, createStore } from 'redux';
import { save, load, RLSOptions } from 'redux-localstorage-simple';
import reducers from '../reducers';

const isProduction = process.env.NODE_ENV !== 'production';
const composeEnhancers: Function = !isProduction && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const localStorageConfig: RLSOptions = {
  states: [ 'settings', 'servers' ],
  namespace: 'shlink',
  namespaceSeparator: '.',
  debounce: 300,
};

const store = createStore(reducers, load(localStorageConfig), composeEnhancers(
  applyMiddleware(save(localStorageConfig), ReduxThunk),
));

export default store;
