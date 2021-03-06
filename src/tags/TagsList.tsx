import { FC, useEffect, useState } from 'react';
import { splitEvery } from 'ramda';
import Message from '../utils/Message';
import SearchField from '../utils/SearchField';
import { SelectedServer } from '../servers/data';
import { boundToMercureHub } from '../mercure/helpers/boundToMercureHub';
import { TagsList as TagsListState } from './reducers/tagsList';
import { TagCardProps } from './TagCard';

const { ceil } = Math;
const TAGS_GROUPS_AMOUNT = 4;

export interface TagsListProps {
  filterTags: (searchTerm: string) => void;
  forceListTags: Function;
  tagsList: TagsListState;
  selectedServer: SelectedServer;
}

const TagsList = (TagCard: FC<TagCardProps>) => boundToMercureHub((
  { filterTags, forceListTags, tagsList, selectedServer }: TagsListProps,
) => {
  const [ displayedTag, setDisplayedTag ] = useState<string | undefined>();

  useEffect(() => {
    forceListTags();
  }, []);

  const renderContent = () => {
    if (tagsList.loading) {
      return <Message noMargin loading />;
    }

    if (tagsList.error) {
      return (
        <div className="col-12">
          <div className="bg-danger p-2 text-white text-center">Error loading tags :(</div>
        </div>
      );
    }

    const tagsCount = tagsList.filteredTags.length;

    if (tagsCount < 1) {
      return <Message>No tags found</Message>;
    }

    const tagsGroups = splitEvery(ceil(tagsCount / TAGS_GROUPS_AMOUNT), tagsList.filteredTags);

    return (
      <>
        {tagsGroups.map((group, index) => (
          <div key={index} className="col-md-6 col-xl-3">
            {group.map((tag) => (
              <TagCard
                key={tag}
                tag={tag}
                tagStats={tagsList.stats[tag]}
                selectedServer={selectedServer}
                displayed={displayedTag === tag}
                toggle={() => setDisplayedTag(displayedTag !== tag ? tag : undefined)}
              />
            ))}
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      {!tagsList.loading && <SearchField className="mb-3" placeholder="Search tags..." onChange={filterTags} />}
      <div className="row">
        {renderContent()}
      </div>
    </>
  );
}, () => 'https://shlink.io/new-visit');

export default TagsList;
