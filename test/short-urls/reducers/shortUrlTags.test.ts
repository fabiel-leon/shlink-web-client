import { Mock } from 'ts-mockery';
import reducer, {
  EDIT_SHORT_URL_TAGS_ERROR,
  EDIT_SHORT_URL_TAGS_START,
  RESET_EDIT_SHORT_URL_TAGS,
  resetShortUrlsTags,
  SHORT_URL_TAGS_EDITED,
  editShortUrlTags,
  EditShortUrlTagsAction,
} from '../../../src/short-urls/reducers/shortUrlTags';
import { ShlinkState } from '../../../src/container/types';

describe('shortUrlTagsReducer', () => {
  const tags = [ 'foo', 'bar', 'baz' ];
  const shortCode = 'abc123';

  describe('reducer', () => {
    const action = (type: string) => Mock.of<EditShortUrlTagsAction>({ type });

    it('returns loading on EDIT_SHORT_URL_TAGS_START', () => {
      expect(reducer(undefined, action(EDIT_SHORT_URL_TAGS_START))).toEqual({
        tags: [],
        shortCode: null,
        saving: true,
        error: false,
      });
    });

    it('returns error on EDIT_SHORT_URL_TAGS_ERROR', () => {
      expect(reducer(undefined, action(EDIT_SHORT_URL_TAGS_ERROR))).toEqual({
        tags: [],
        shortCode: null,
        saving: false,
        error: true,
      });
    });

    it('returns provided tags and shortCode on SHORT_URL_TAGS_EDITED', () => {
      expect(reducer(undefined, { type: SHORT_URL_TAGS_EDITED, tags, shortCode, domain: null })).toEqual({
        tags,
        shortCode,
        saving: false,
        error: false,
      });
    });

    it('goes back to initial state on RESET_EDIT_SHORT_URL_TAGS', () => {
      expect(reducer(undefined, action(RESET_EDIT_SHORT_URL_TAGS))).toEqual({
        tags: [],
        shortCode: null,
        saving: false,
        error: false,
      });
    });
  });

  describe('resetShortUrlsTags', () => {
    it('creates expected action', () => expect(resetShortUrlsTags()).toEqual({ type: RESET_EDIT_SHORT_URL_TAGS }));
  });

  describe('editShortUrlTags', () => {
    const updateShortUrlTags = jest.fn();
    const buildShlinkApiClient = jest.fn().mockReturnValue({ updateShortUrlTags });
    const dispatch = jest.fn();
    const getState = () => Mock.all<ShlinkState>();

    afterEach(jest.clearAllMocks);

    it.each([[ undefined ], [ null ], [ 'example.com' ]])('dispatches normalized tags on success', async (domain) => {
      const normalizedTags = [ 'bar', 'foo' ];

      updateShortUrlTags.mockResolvedValue(normalizedTags);

      await editShortUrlTags(buildShlinkApiClient)(shortCode, domain, tags)(dispatch, getState);

      expect(buildShlinkApiClient).toHaveBeenCalledTimes(1);
      expect(updateShortUrlTags).toHaveBeenCalledTimes(1);
      expect(updateShortUrlTags).toHaveBeenCalledWith(shortCode, domain, tags);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, { type: EDIT_SHORT_URL_TAGS_START });
      expect(dispatch).toHaveBeenNthCalledWith(
        2,
        { type: SHORT_URL_TAGS_EDITED, tags: normalizedTags, shortCode, domain },
      );
    });

    it('dispatches error on failure', async () => {
      const error = new Error();

      updateShortUrlTags.mockRejectedValue(error);

      try {
        await editShortUrlTags(buildShlinkApiClient)(shortCode, undefined, tags)(dispatch, getState);
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(buildShlinkApiClient).toHaveBeenCalledTimes(1);
      expect(updateShortUrlTags).toHaveBeenCalledTimes(1);
      expect(updateShortUrlTags).toHaveBeenCalledWith(shortCode, undefined, tags);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenNthCalledWith(1, { type: EDIT_SHORT_URL_TAGS_START });
      expect(dispatch).toHaveBeenNthCalledWith(2, { type: EDIT_SHORT_URL_TAGS_ERROR });
    });
  });
});
