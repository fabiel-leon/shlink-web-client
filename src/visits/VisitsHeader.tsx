import { Button, Card } from 'reactstrap';
import { FC, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ShortUrlVisitsCount from '../short-urls/helpers/ShortUrlVisitsCount';
import { ShortUrl } from '../short-urls/data';
import { Visit } from './types';

interface VisitsHeaderProps {
  visits: Visit[];
  goBack: () => void;
  title: ReactNode;
  shortUrl?: ShortUrl;
}

const VisitsHeader: FC<VisitsHeaderProps> = ({ visits, goBack, shortUrl, children, title }) => (
  <header>
    <Card className="bg-light" body>
      <h2 className="d-flex justify-content-between align-items-center mb-0">
        <Button color="link" size="lg" className="p-0 mr-3" onClick={goBack}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </Button>
        <span className="text-center d-none d-sm-block">
          <small>{title}</small>
        </span>
        <span className="badge badge-main ml-3">
          Visits:{' '}
          <ShortUrlVisitsCount visitsCount={visits.length} shortUrl={shortUrl} />
        </span>
      </h2>
      <h3 className="text-center d-block d-sm-none mb-0 mt-3">
        <small>{title}</small>
      </h3>

      {children && <div className="mt-md-2">{children}</div>}
    </Card>
  </header>
);

export default VisitsHeader;
