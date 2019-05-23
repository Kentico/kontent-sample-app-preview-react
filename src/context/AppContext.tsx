import React from 'react';

interface IAppContextComponentState {
  readonly products: Array<IProduct>;
}

interface IProduct {
  readonly title: string;
  readonly pictureUrl: string;
  readonly description: string;
}

interface IAppContext extends IAppContextComponentState {
  readonly addProduct: (product: IProduct) => void;
}

const defaultAppContext: IAppContext = {
  products: new Array<IProduct>(),
  addProduct: () => undefined,
};

const context = React.createContext<IAppContext>(defaultAppContext);
const AppContextProvider = context.Provider;

export const AppContextConsumer = context.Consumer;

export class AppContextComponent extends React.PureComponent<{}, IAppContextComponentState> {
  readonly state = {
    products: [],
  };

  addProduct = (product: IProduct) => {
    this.setState((state) => ({ products: state.products.concat(product) }))
  };

  render() {
    const { products } = this.state;
    const contextValue: IAppContext = {
      products,
      addProduct: this.addProduct,
    };

    return (
      <AppContextProvider value={contextValue}>
        {this.props.children}
      </AppContextProvider>
    )
  }
}
