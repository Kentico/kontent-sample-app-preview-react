import React from 'react';
import { AppContextConsumer } from '../context/AppContext';
import { PageContent } from './PageContent';
import { ArticleExampleContentType } from "../models/Article";

interface IWelcomePageProps {
  readonly article: ArticleExampleContentType;
  readonly init: () => void;
}

class WelcomePage extends React.PureComponent<IWelcomePageProps> {
  componentDidMount(): void {
    this.props.init();
  }

  render() {
    const { article } = this.props;
    if (article) {
      return (
        <PageContent
          itemId={article.system.id}
          title={article.title.value}
        >
          <div
            data-kontent-element-codename='body'
            dangerouslySetInnerHTML={{ __html: article.body.resolveHtml() }}
          />
        </PageContent>
      );
    }

    return <p>Missing data for Welcome page</p>;
  }
}

const WelcomePageConnected = () => (
  <AppContextConsumer>
    {appContext => (
      <WelcomePage
        article={appContext.articles[0]}
        init={appContext.loadWelcomePage} />
    )}
  </AppContextConsumer>
);

export { WelcomePageConnected as WelcomePage }
