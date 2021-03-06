
import { ContentItem, Elements } from '@kentico/kontent-delivery';

/**
 * Generated by '@kentico/kontent-model-generator@3.0.0'
 * Timestamp: Thu Feb 20 2020 08:40:57 GMT+0100 (GMT+01:00)
 *
 * Tip: You can replace 'ContentItem' with another generated class to fully leverage strong typing.
 */
export class ProductExampleContentType extends ContentItem {
  public url!: Elements.UrlSlugElement;
  public description!: Elements.RichTextElement;
  public name!: Elements.TextElement;
  public image!: Elements.AssetsElement;
  public taxonomyCategorizingTargetAudience!: Elements.TaxonomyElement;
  constructor() {
    super({
      propertyResolver: ((elementName: string) => {
        if (elementName === 'taxonomy___categorizing_target_audience') {
          return 'taxonomyCategorizingTargetAudience';
        }
        return elementName;
      })
    });
  }
}
