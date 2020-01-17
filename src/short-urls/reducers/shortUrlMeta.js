import { createAction, handleActions } from 'redux-actions';
import PropTypes from 'prop-types';
import { shortUrlMetaType } from './shortUrlsList';

/* eslint-disable padding-line-between-statements */
export const EDIT_SHORT_URL_META_START = 'shlink/shortUrlMeta/EDIT_SHORT_URL_META_START';
export const EDIT_SHORT_URL_META_ERROR = 'shlink/shortUrlMeta/EDIT_SHORT_URL_META_ERROR';
export const EDIT_SHORT_URL_META = 'shlink/shortUrlMeta/EDIT_SHORT_URL_META';
export const RESET_EDIT_SHORT_URL_META = 'shlink/shortUrlMeta/RESET_EDIT_SHORT_URL_META';
export const SHORT_URL_META_EDITED = 'shlink/shortUrlMeta/SHORT_URL_META_EDITED';
/* eslint-enable padding-line-between-statements */

export const shortUrlEditMetaType = PropTypes.shape({
  shortCode: PropTypes.string,
  meta: shortUrlMetaType.isRequired,
  saving: PropTypes.bool.isRequired,
  error: PropTypes.bool.isRequired,
});

const initialState = {
  shortCode: null,
  meta: {},
  saving: false,
  error: false,
};

export default handleActions({
  [EDIT_SHORT_URL_META_START]: (state) => ({ ...state, saving: true, error: false }),
  [EDIT_SHORT_URL_META_ERROR]: (state) => ({ ...state, saving: false, error: true }),
  [EDIT_SHORT_URL_META]: (state, { shortCode, meta }) => ({ shortCode, meta, saving: false, error: false }),
  [RESET_EDIT_SHORT_URL_META]: () => initialState,
}, initialState);

export const editShortUrlMeta = (buildShlinkApiClient) => (shortCode, meta) => async (dispatch, getState) => {
  dispatch({ type: EDIT_SHORT_URL_META_START });
  const { updateShortUrlMeta } = await buildShlinkApiClient(getState);

  try {
    await updateShortUrlMeta(shortCode, meta);
    dispatch({ shortCode, meta, type: EDIT_SHORT_URL_META });
  } catch (e) {
    dispatch({ type: EDIT_SHORT_URL_META_ERROR });
  }
};

export const resetShortUrlMeta = createAction(RESET_EDIT_SHORT_URL_META);

export const shortUrlMetaEdited = (shortCode, meta) => ({
  meta,
  shortCode,
  type: SHORT_URL_META_EDITED,
});
