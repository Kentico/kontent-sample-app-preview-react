import React from 'react';
import { clearInterval, setInterval } from 'timers';
import { LoadingStatus } from '../enums/LoadingStatus';
import { PollingStatus } from '../enums/PollingStatus';
import { ArticleExampleContentType } from '../models/Article';
import { ProductExampleContentType } from '../models/Product';
import { getAllArticles, getProductsPage } from '../repositories/contentItemRepository';

interface IAppContextState {
  readonly dataLoadingStatus: LoadingStatus;
  readonly dataPollingStatus: PollingStatus;
  readonly previewApiKey: string;
  readonly previewApiKeyLoadingStatus: LoadingStatus;
  readonly projectId: string;
  readonly projectIdLoadingStatus: LoadingStatus;
  readonly articles: Array<ArticleExampleContentType>;
  readonly products: Array<ProductExampleContentType>;
}

interface IAppContextProps {
  readonly loadWelcomePage: () => void;
  readonly loadProducts: () => void;
  readonly setProjectId: (projectId: string) => void;
  readonly setLoadingStatus: (loadingStatus: LoadingStatus) => void;
  readonly setProjectIdLoadingStatus: (projectIdLoadingStatus: LoadingStatus) => void;
  readonly setPreviewApiKey: (previewApiKey: string) => void;
  readonly setPreviewApiKeyLoadingStatus: (previewApiKeyLoadingStatus: LoadingStatus) => void;
}

export interface IAppContext extends IAppContextState, IAppContextProps {
}

const defaultAppContext: IAppContext = {
  dataLoadingStatus: LoadingStatus.NotLoaded,
  dataPollingStatus: PollingStatus.Stopped,
  previewApiKey: '',
  previewApiKeyLoadingStatus: LoadingStatus.NotLoaded,
  projectId: '',
  projectIdLoadingStatus: LoadingStatus.NotLoaded,
  articles: new Array<ArticleExampleContentType>(),
  products: new Array<ProductExampleContentType>(),
  loadWelcomePage: () => undefined,
  loadProducts: () => undefined,
  setProjectId: () => undefined,
  setLoadingStatus: () => undefined,
  setProjectIdLoadingStatus: () => undefined,
  setPreviewApiKey: () => undefined,
  setPreviewApiKeyLoadingStatus: () => undefined,
};

export const AppContext = React.createContext<IAppContext>(defaultAppContext);
const AppContextProvider = AppContext.Provider;
export const AppContextConsumer = AppContext.Consumer;

export class AppContextComponent extends React.PureComponent<{}, IAppContextState> {

  readonly state = {
    dataLoadingStatus: LoadingStatus.NotLoaded,
    dataPollingStatus: PollingStatus.Stopped,
    previewApiKey: '',
    previewApiKeyLoadingStatus: LoadingStatus.NotLoaded,
    projectId: '',
    projectIdLoadingStatus: LoadingStatus.NotLoaded,
    articles: new Array<ArticleExampleContentType>(),
    products: new Array<ProductExampleContentType>(),
  };

  private _dataPollingInterval: NodeJS.Timer | null = null;

  private _startDataPolling = (callback: () => void): void => {
    if (this._dataPollingInterval !== null) {
      clearInterval(this._dataPollingInterval);
    }

    this._dataPollingInterval = setInterval(async () => {
      this.setState({ dataPollingStatus: PollingStatus.Fetching });
      await callback();
      this.setState({ dataPollingStatus: PollingStatus.Waiting });
    }, 3000);
    this.setState({ dataPollingStatus: PollingStatus.Waiting });
  };

  setProjectId = (projectId: string) => {
    this.setState({ projectId });
  };

  setLoadingStatus = (loadingStatus: LoadingStatus) => {
    this.setState({ dataLoadingStatus: loadingStatus });
  };

  setProjectIdLoadingStatus = (projectIdLoadingStatus: LoadingStatus) => {
    this.setState({ projectIdLoadingStatus });
  };

  setPreviewApiKey = (previewApiKey: string) => {
    this.setState({ previewApiKey });
  };

  setPreviewApiKeyLoadingStatus = (previewApiKeyLoadingStatus: LoadingStatus) => {
    this.setState({ previewApiKeyLoadingStatus });
  };

  private _loadWelcomePageData = async () => {
    const articles = await getAllArticles(this.state.projectId, this.state.previewApiKey);
    this.setState({ articles });
  };

  loadWelcomePage = async () => {
    this._startDataPolling(this._loadWelcomePageData);
    await this._loadWelcomePageData();
  };

  private _loadProductsData = async () => {
    const productsPage = await getProductsPage(this.state.projectId, this.state.previewApiKey);
    if (productsPage && productsPage[0]) {
      this.setState({ products: productsPage[0].productList.value as Array<ProductExampleContentType> });
    }
  };

  loadProducts = async () => {
    this._startDataPolling(this._loadProductsData);
    await this._loadProductsData();
  };

  render() {
    const {
      products,
      articles,
      projectId,
      dataLoadingStatus,
      dataPollingStatus,
      projectIdLoadingStatus,
      previewApiKey,
      previewApiKeyLoadingStatus,
    } = this.state;

    const contextValue: IAppContext = {
      dataLoadingStatus,
      dataPollingStatus,
      previewApiKey,
      previewApiKeyLoadingStatus,
      projectId,
      projectIdLoadingStatus,
      articles,
      products,
      loadWelcomePage: this.loadWelcomePage,
      loadProducts: this.loadProducts,
      setProjectId: this.setProjectId,
      setLoadingStatus: this.setLoadingStatus,
      setProjectIdLoadingStatus: this.setProjectIdLoadingStatus,
      setPreviewApiKey: this.setPreviewApiKey,
      setPreviewApiKeyLoadingStatus: this.setPreviewApiKeyLoadingStatus,
    };

    return (
      <AppContextProvider value={contextValue}>
        {this.props.children}
      </AppContextProvider>
    );
  }
}
