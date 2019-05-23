import React from 'react';
import {Link} from 'react-router-dom';
import {PageContent} from './PageContentWrapper';
import {AppContextConsumer} from "../context/AppContext";

export const LandingPage = (): JSX.Element => {
  return (
    <PageContent>
      <h1>🚀 A landing page! 🚀 This page is built by linking other content</h1>
      <AddNewProduct />
      <ProductList />
    </PageContent>)
};

const AddNewProduct: React.FunctionComponent = () => (
  <div>
    <AppContextConsumer>
      {appContext => (
        <>
          <div className="add-new-product" onClick={() => appContext.addProduct({
            pictureUrl: "https://dev-preview-assets-eu-01.global.ssl.fastly.net:443/a7e13f86-7f42-0047-0e15-cdde6e902aca/8c81fa7b-6727-44d8-ab72-341dac7c6153/headless_horseman.png",
            title: "Another product",
            description: "Description of another product",
          })}>Add New Product</div>
        </>
      )}
    </AppContextConsumer>
  </div>
);

const ProductList: React.FunctionComponent = () => (
  <AppContextConsumer>
    {appContext => (
      <div className="product-list">
        Linked products:
        <ol>
          {appContext.products.map((product, index) => (
            <li key={index}>
              <Link to="/product">
                <div className="product-list__item">
                  <img
                    src={product.pictureUrl}
                    width="50px" height="50px"/>
                  <span>{product.title}</span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    )}
  </AppContextConsumer>
);
