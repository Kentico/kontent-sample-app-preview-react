import React from 'react';
import './PageContent.css';

export interface IPageContentProps {
  readonly itemId?: string;
  readonly title: string;
}

export const PageContent: React.FunctionComponent<IPageContentProps> = ({ itemId, title, children }) => (
  <div
    data-kk-item-id={itemId}
    className="page-content"
  >
    <div
      data-kk-element-codename="name"
      className="app-title"
    >
      {title}
    </div>
    <div className="app-content">
      {children}
    </div>
  </div>
);
