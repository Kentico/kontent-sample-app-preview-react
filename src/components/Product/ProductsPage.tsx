import React from 'react';
import { AppContextConsumer } from '../../context/AppContext';
import { PageContent } from '../PageContent';
import './ProductsPage.css';
import { ProductExampleContentType } from '../../models/Product';
import { ProductCard } from './ProductCard';
import classNames from 'classnames';

interface IProductsPageProps {
  readonly init: () => void;
  readonly projectId: string;
  readonly products: Array<ProductExampleContentType>;
}

class ProductsPage extends React.PureComponent<IProductsPageProps> {
  componentDidMount(): void {
    this.props.init();
  }

  render() {
    const { projectId, products } = this.props;
    const isSingleProduct = products.length === 1;

    return (
      <PageContent title="Products">
        <div data-kk-element-codename="product_list" className={classNames('products-page', {
          'products-page--has-single-product': isSingleProduct,
        })}>
          {products && products.length > 0 && Array(1000).fill(0).map((_val, index: number) => {
            const product = products[index % products.length];
            return (
              <ProductCard
                itemId={product.system.id}
                title={product.name.value}
                pictureUrl={product.image.value[0] ? product.image.value[0].url : ''}
                productId={product.url.value}
                projectId={projectId}
                key={index}
              />
            );
          })}
        </div>
      </PageContent>
    );
  }
}

const ProductsPageConnected = () => (
  <AppContextConsumer>
    {appContext => (
      <ProductsPage
        init={appContext.loadProducts}
        projectId={appContext.projectId}
        products={appContext.getProducts()}
      />
    )}
  </AppContextConsumer>
);

export { ProductsPageConnected as ProductsPage };
