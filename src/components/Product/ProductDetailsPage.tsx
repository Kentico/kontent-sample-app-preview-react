import React from 'react';
import {
  AppContextConsumer,
} from '../../context/AppContext';
import './ProductDetailsPage.css';
import './Testimonial.css';
import { ProductDetailsRouteParams } from "../../constants/routePaths";
import { ProductExampleContentType } from "../../models/Product";
import { PageContent } from "../PageContent";

interface IProductDetailsPage {
  readonly product: ProductExampleContentType;
  readonly init: () => void;
}

class ProductDetailsPage extends React.PureComponent<IProductDetailsPage> {
  componentDidMount(): void {
    this.props.init();
  }

  render() {
    const { product } = this.props;
    if (product) {
      const pictureUrl = product.image.value[0] ? product.image.value[0].url : '';
      return (
        <PageContent
          itemId={product.system.id}
          title={product.name.value}
        >
          {pictureUrl && (
            <img
              data-kk-element-codename="image"
              className="product-details__image"
              alt={product.name.value}
              src={product.image.value[0] ? product.image.value[0].url : ''}
            />
          )}

          <div
            data-kk-element-codename="description"
            className="product-details__description"
            dangerouslySetInnerHTML={{ __html: product.description.resolveHtml() }}
          />
        </PageContent>);
    }

    return <p>There's no such product</p>;
  }
}

interface IProductDetailsPageConnectedProps {
  readonly match: {
    readonly params: ProductDetailsRouteParams;
  };
}

const ProductDetailsPageConnected: React.FunctionComponent<IProductDetailsPageConnectedProps> = ({ match }) => (
  <AppContextConsumer>
    {appContext => (
      <ProductDetailsPage
        product={appContext.productsByUrlSlug[match.params.productUrlSlug]}
        init={() => appContext.loadProduct(match.params.productUrlSlug)}
      />
    )}
  </AppContextConsumer>
);

export { ProductDetailsPageConnected as ProductDetailsPage }
