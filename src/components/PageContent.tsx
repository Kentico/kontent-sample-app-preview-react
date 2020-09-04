import React from 'react';
import './PageContent.css';

export interface IPageContentProps {
  readonly itemId?: string;
  readonly title: string;
}

export const PageContent: React.FunctionComponent<IPageContentProps> = ({ itemId, title, children }) => (
  <div
    data-kontent-item-id={itemId}
  >
    <div
      data-kontent-element-codename="title"
      className="app-title"
      data-asdsad="asdsad"
    >
      {title}
    </div>
    <div className="app-content">
      {children}
    </div>
  </div>
);
