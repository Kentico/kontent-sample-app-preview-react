
import { ContentItem, Elements } from '@kentico/kontent-delivery';

/**
 * Generated by '@kentico/kontent-model-generator@3.0.0'
 * Timestamp: Thu Feb 20 2020 08:40:57 GMT+0100 (GMT+01:00)
 *
 * Tip: You can replace 'ContentItem' with another generated class to fully leverage strong typing.
 */
export class LandingPageExampleContentType extends ContentItem {
  public body!: Elements.RichTextElement;
  public productList!: Elements.LinkedItemsElement<ContentItem>;
  public title!: Elements.TextElement;
  public url!: Elements.UrlSlugElement;
  constructor() {
    super({
      propertyResolver: ((elementName: string) => {
        if (elementName === 'product_list') {
          return 'productList';
        }
        return elementName;
      })
    });
  }
}
