import React from 'react';
import { clearInterval, setInterval } from 'timers';
import { LoadingStatus } from '../enums/LoadingStatus';
import { PollingStatus } from '../enums/PollingStatus';
import { ArticleExampleContentType } from '../models/Article';
import { ProductExampleContentType } from '../models/Product';
import { getAllArticles, getProductsPage, getProductDetailsByUrlSlug } from '../repositories/contentItemRepository';
import KontentSmartLink from '@kentico/kontent-smart-link';
import '@kentico/kontent-smart-link/dist/kontent-smart-link.styles.css';

interface IAppContextState {
  readonly dataLoadingStatus: LoadingStatus;
  readonly dataPollingStatus: PollingStatus;
  readonly previewApiKey: string;
  readonly previewApiKeyLoadingStatus: LoadingStatus;
  readonly projectId: string;
  readonly projectIdLoadingStatus: LoadingStatus;
  readonly articles: Array<ArticleExampleContentType>;
  readonly productsByUrlSlug: {[key: string]: ProductExampleContentType};
}

interface IAppContextProps {
  readonly loadWelcomePage: () => void;
  readonly loadProduct: (productUrlSlug: string) => void;
  readonly loadProducts: () => void;
  readonly getProducts: () => Array<ProductExampleContentType>;
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
  productsByUrlSlug: {},
  loadWelcomePage: () => undefined,
  loadProduct: () => undefined,
  loadProducts: () => undefined,
  getProducts: () => [],
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
    productsByUrlSlug: {},
  };

  private _dataPollingInterval: NodeJS.Timer | null = null;

  componentDidMount() {
    KontentSmartLink.initializeOnLoad({
      projectId: '220af705-8621-00d0-2f33-97101edbf600',
      languageCodename: 'default',
      queryParam: 'preview',
    }).then(() => {
      console.log('Kontent Smart Link SDK initialized');
    });
  }

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
      const newProducts = productsPage[0].productList.value as Array<ProductExampleContentType>;
      this.setState((state) => ({ productsByUrlSlug: newProducts
          .reduce((byId, product: ProductExampleContentType) => ({...byId, [product.url.value]: product}),
            Object.assign({}, state.productsByUrlSlug))
      }));
    }
  };

  loadProducts = async () => {
    this._startDataPolling(this._loadProductsData);
    await this._loadProductsData();
  };

  private _loadProductData = async (productUrlSlug: string) => {
    const product = await getProductDetailsByUrlSlug(this.state.projectId, this.state.previewApiKey, productUrlSlug);
    if (product) {
      this.setState((state) => ({ productsByUrlSlug: ({...Object.assign({}, state.productsByUrlSlug), [product.url.value]: product})}));
    }
  };

  loadProduct = async (productUrlSlug: string) => {
    this._startDataPolling(() => this._loadProductData(productUrlSlug));
    await this._loadProductData(productUrlSlug);
  };

  getProducts = (): Array<ProductExampleContentType> => Object.values(this.state.productsByUrlSlug);

  render() {
    const {
      productsByUrlSlug,
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
      productsByUrlSlug,
      loadWelcomePage: this.loadWelcomePage,
      loadProduct: this.loadProduct,
      loadProducts: this.loadProducts,
      getProducts: this.getProducts,
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
