import { assign } from 'min-dash';

import TextUtil from 'diagram-js/lib/util/Text';

var DEFAULT_FONT_SIZE = 12;
var LINE_HEIGHT_RATIO = 1.2;
const LABEL_COLOUR = "#01031b";
var MIN_TEXT_ANNOTATION_HEIGHT = 30;

export default function TSTextRenderer(config) {

  var defaultStyle = assign({
    fontFamily: 'Arial, sans-serif',
    fontSize: DEFAULT_FONT_SIZE,
    fontWeight: 'normal',
    color: LABEL_COLOUR,
    background: "rgba(0,0,0,0.5)",
    lineHeight: LINE_HEIGHT_RATIO
  }, config && config.defaultStyle || {});

  var externalStyle = assign({}, defaultStyle, {
    fontSize: DEFAULT_FONT_SIZE
  }, config && config.externalStyle || {});

  var textUtil = new TextUtil({
    style: defaultStyle
  });

  /**
   * Get the new bounds of an externally rendered,
   * layouted label.
   *
   * @param {Rect} bounds
   * @param {string} text
   *
   * @return {Rect}
   */
  this.getExternalLabelBounds = function(bounds, text) {

    var layoutedDimensions = textUtil.getDimensions(text, {
      box: {
        width: 90,
        height: 100
      },
      style: externalStyle
    });

    // resize label shape to fit label text
    return {
      x: Math.round(bounds.x + bounds.width / 2 - layoutedDimensions.width / 2),
      y: Math.round(bounds.y),
      width: Math.ceil(layoutedDimensions.width),
      height: Math.ceil(layoutedDimensions.height)
    };

  };

  /**
   * Get the new bounds of text annotation.
   *
   * @param {Rect} bounds
   * @param {string} text
   *
   * @return {Rect}
   */
  this.getTextAnnotationBounds = function(bounds, text) {

    var layoutedDimensions = textUtil.getDimensions(text, {
      box: bounds,
      style: defaultStyle,
      align: 'left-top',
      padding: 5
    });

    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: Math.max(MIN_TEXT_ANNOTATION_HEIGHT, Math.round(layoutedDimensions.height))
    };
  };

  /**
   * Create a layouted text element.
   *
   * @param {string} text
   * @param {TextLayoutConfig} [options]
   *
   * @return {SVGElement} rendered text
   */
  this.createText = function(text, options) {
    return textUtil.createText(text, options || {});
  };

  /**
   * Get default text style.
   */
  this.getDefaultStyle = function() {
    return defaultStyle;
  };

  /**
   * Get the external text style.
   */
  this.getExternalStyle = function() {
    return externalStyle;
  };

}

TSTextRenderer.$inject = [
  'config.textRenderer'
];