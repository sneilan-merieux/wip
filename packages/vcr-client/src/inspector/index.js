import { $, getElementInfo, isDOM, addRule, findIndex } from './dom.js';
import { throttle, isNull } from './utils.js';
import logger from './logger.js';

const css = require('raw-loader!./style.css');

class DomInspector {
  constructor(options = {}) {
    this.contentWindow = options.contentWindow || window;
    this._doc = this.contentWindow.document;
    this.root = options.root ? (this.isDOM(options.root) ? options.root : this.$(options.root)) : this.$('body');
    if (isNull(this.root)) {
      logger.warn('Root element is null. Auto select body as root');
      this.root = this.$('body');
    }
    this.theme = options.theme || 'dom-inspector-theme-default';
    this.overlay = {};
    this.overlayId = '';
    this.target = '';
    this.destroyed = false;
    this._cachedTarget = '';
    this._throttleOnMove = throttle(this.handleMove.bind(this), 100);
    this.handleClick = this.handleClick.bind(this);
    this.listeners = [];
    this.init();
  }

  isDOM(ele) {
    return isDOM(ele, this.contentWindow);
  }

  $(selector, parent) {
    return $(selector, parent || this.contentWindow.document);
  }

  enable() {
    if (this.destroyed) return logger.warn('Inspector instance has been destroyed! Please redeclare it.');
    this.overlay.parent.style.display = 'block';
    this.root.addEventListener('mousemove', this._throttleOnMove);
    this.root.addEventListener('click', this.handleClick);
  }
  pause() {
    this.root.removeEventListener('mousemove', this._throttleOnMove);
  }
  disable() {
    this.overlay.parent.style.display = 'none';
    this.overlay.parent.style.width = 0;
    this.overlay.parent.style.height = 0;
    this.target = null;
    this.root.removeEventListener('mousemove', this._throttleOnMove);
    this.root.removeEventListener('click', this.handleClick);
  }
  destroy() {
    this.destroyed = true;
    this.disable();
    this.overlay = {};
  }
  getXPath(ele) {
    if (!this.isDOM(ele) && !this.target)
      return logger.warn('Target element is not found. Warning function name:%c getXPath', 'color: #ff5151');
    if (!ele) ele = this.target;

    if (ele.hasAttribute('id')) {
      return `//${ele.tagName.toLowerCase()}[@id="${ele.id}"]`;
    }

    if (ele.hasAttribute('class')) {
      return `//${ele.tagName.toLowerCase()}[@class="${ele.getAttribute('class')}"]`;
    }

    const path = [];
    while (ele.nodeType === Node.ELEMENT_NODE) {
      const currentTag = ele.nodeName.toLowerCase();
      const nth = findIndex(ele, currentTag);
      path.push(`${ele.tagName.toLowerCase()}${nth === 1 ? '' : `[${nth}]`}`);
      ele = ele.parentNode;
    }
    return `/${path.reverse().join('/')}`;
  }
  getSelector(ele) {
    if (!this.isDOM(ele) && !this.target)
      return logger.warn('Target element is not found. Warning function name:%c getCssPath', 'color: #ff5151');
    if (!ele) ele = this.target;
    const path = [];
    while (ele.nodeType === Node.ELEMENT_NODE) {
      let currentSelector = ele.nodeName.toLowerCase();
      if (ele.hasAttribute('id')) {
        currentSelector += `#${ele.id}`;
      } else {
        const nth = findIndex(ele, currentSelector);
        if (nth !== 1) currentSelector += `:nth-of-type(${nth})`;
      }
      path.unshift(currentSelector);
      ele = ele.parentNode;
    }
    return path.join('>');
  }

  getElementInfo(ele) {
    if (!this.isDOM(ele) && !this.target)
      return logger.warn('Target element is not found. Warning function name:%c getElementInfo', 'color: #ff5151');
    return getElementInfo(ele || this.target);
  }

  injectCSS() {
    const node = document.createElement('style');
    node.innerHTML = css;
    this.$('body').appendChild(node);
  }

  init() {
    this.overlayId = `dom-inspector-${Date.now()}`;

    const parent = this._createElement('div', {
      id: this.overlayId,
      class: `dom-inspector ${this.theme}`,
    });

    this.overlay = {
      parent,
      content: this._createSurroundEle(parent, 'content'),
      paddingTop: this._createSurroundEle(parent, 'padding padding-top'),
      paddingRight: this._createSurroundEle(parent, 'padding padding-right'),
      paddingBottom: this._createSurroundEle(parent, 'padding padding-bottom'),
      paddingLeft: this._createSurroundEle(parent, 'padding padding-left'),
      borderTop: this._createSurroundEle(parent, 'border border-top'),
      borderRight: this._createSurroundEle(parent, 'border border-right'),
      borderBottom: this._createSurroundEle(parent, 'border border-bottom'),
      borderLeft: this._createSurroundEle(parent, 'border border-left'),
      marginTop: this._createSurroundEle(parent, 'margin margin-top'),
      marginRight: this._createSurroundEle(parent, 'margin margin-right'),
      marginBottom: this._createSurroundEle(parent, 'margin margin-bottom'),
      marginLeft: this._createSurroundEle(parent, 'margin margin-left'),
      tips: this._createSurroundEle(
        parent,
        'tips',
        '<div class="tag"></div><div class="id"></div><div class="class"></div><div class="line">&nbsp;|&nbsp;</div><div class="size"></div><div class="triangle"></div>',
      ),
    };

    this.$('body').appendChild(parent);
    this.injectCSS();
  }

  _createElement(tag, attr, content) {
    const ele = this._doc.createElement(tag);
    Object.keys(attr).forEach(item => {
      ele.setAttribute(item, attr[item]);
    });
    if (content) ele.innerHTML = content;
    return ele;
  }

  _createSurroundEle(parent, className, content) {
    const ele = this._createElement(
      'div',
      {
        class: className,
      },
      content,
    );
    parent.appendChild(ele);
    return ele;
  }

  handleMove(e) {
    this.target = e.target;
    if (this.target === this._cachedTarget) return null;
    this._cachedTarget = this.target;
    const elementInfo = getElementInfo(e.target);
    const contentLevel = {
      width: elementInfo.width,
      height: elementInfo.height,
    };
    const paddingLevel = {
      width: elementInfo['padding-left'] + contentLevel.width + elementInfo['padding-right'],
      height: elementInfo['padding-top'] + contentLevel.height + elementInfo['padding-bottom'],
    };
    const borderLevel = {
      width: elementInfo['border-left-width'] + paddingLevel.width + elementInfo['border-right-width'],
      height: elementInfo['border-top-width'] + paddingLevel.height + elementInfo['border-bottom-width'],
    };
    const marginLevel = {
      width: elementInfo['margin-left'] + borderLevel.width + elementInfo['margin-right'],
      height: elementInfo['margin-top'] + borderLevel.height + elementInfo['margin-bottom'],
    };

    // 保证 overlay 最大 z-index
    if (this.overlay.parent.style['z-index'] <= elementInfo['z-index'])
      this.overlay.parent.style['z-index'] = elementInfo['z-index'] + 1;

    // so crazy
    addRule(this.overlay.parent, {
      width: `${marginLevel.width}px`,
      height: `${marginLevel.height}px`,
      top: `${elementInfo.top}px`,
      left: `${elementInfo.left}px`,
    });
    addRule(this.overlay.content, {
      width: `${contentLevel.width}px`,
      height: `${contentLevel.height}px`,
      top: `${elementInfo['margin-top'] + elementInfo['border-top-width'] + elementInfo['padding-top']}px`,
      left: `${elementInfo['margin-left'] + elementInfo['border-left-width'] + elementInfo['padding-left']}px`,
    });
    addRule(this.overlay.paddingTop, {
      width: `${paddingLevel.width}px`,
      height: `${elementInfo['padding-top']}px`,
      top: `${elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      left: `${elementInfo['margin-left'] + elementInfo['border-left-width']}px`,
    });
    addRule(this.overlay.paddingRight, {
      width: `${elementInfo['padding-right']}px`,
      height: `${paddingLevel.height - elementInfo['padding-top']}px`,
      top: `${elementInfo['padding-top'] + elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      right: `${elementInfo['margin-right'] + elementInfo['border-right-width']}px`,
    });
    addRule(this.overlay.paddingBottom, {
      width: `${paddingLevel.width - elementInfo['padding-right']}px`,
      height: `${elementInfo['padding-bottom']}px`,
      bottom: `${elementInfo['margin-bottom'] + elementInfo['border-bottom-width']}px`,
      right: `${elementInfo['padding-right'] + elementInfo['margin-right'] + elementInfo['border-right-width']}px`,
    });
    addRule(this.overlay.paddingLeft, {
      width: `${elementInfo['padding-left']}px`,
      height: `${paddingLevel.height - elementInfo['padding-top'] - elementInfo['padding-bottom']}px`,
      top: `${elementInfo['padding-top'] + elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      left: `${elementInfo['margin-left'] + elementInfo['border-left-width']}px`,
    });
    addRule(this.overlay.borderTop, {
      width: `${borderLevel.width}px`,
      height: `${elementInfo['border-top-width']}px`,
      top: `${elementInfo['margin-top']}px`,
      left: `${elementInfo['margin-left']}px`,
    });
    addRule(this.overlay.borderRight, {
      width: `${elementInfo['border-right-width']}px`,
      height: `${borderLevel.height - elementInfo['border-top-width']}px`,
      top: `${elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      right: `${elementInfo['margin-right']}px`,
    });
    addRule(this.overlay.borderBottom, {
      width: `${borderLevel.width - elementInfo['border-right-width']}px`,
      height: `${elementInfo['border-bottom-width']}px`,
      bottom: `${elementInfo['margin-bottom']}px`,
      right: `${elementInfo['margin-right'] + elementInfo['border-right-width']}px`,
    });
    addRule(this.overlay.borderLeft, {
      width: `${elementInfo['border-left-width']}px`,
      height: `${borderLevel.height - elementInfo['border-top-width'] - elementInfo['border-bottom-width']}px`,
      top: `${elementInfo['margin-top'] + elementInfo['border-top-width']}px`,
      left: `${elementInfo['margin-left']}px`,
    });
    addRule(this.overlay.marginTop, {
      width: `${marginLevel.width}px`,
      height: `${elementInfo['margin-top']}px`,
      top: 0,
      left: 0,
    });
    addRule(this.overlay.marginRight, {
      width: `${elementInfo['margin-right']}px`,
      height: `${marginLevel.height - elementInfo['margin-top']}px`,
      top: `${elementInfo['margin-top']}px`,
      right: 0,
    });
    addRule(this.overlay.marginBottom, {
      width: `${marginLevel.width - elementInfo['margin-right']}px`,
      height: `${elementInfo['margin-bottom']}px`,
      bottom: 0,
      right: `${elementInfo['margin-right']}px`,
    });
    addRule(this.overlay.marginLeft, {
      width: `${elementInfo['margin-left']}px`,
      height: `${marginLevel.height - elementInfo['margin-top'] - elementInfo['margin-bottom']}px`,
      top: `${elementInfo['margin-top']}px`,
      left: 0,
    });

    this.$('.tag', this.overlay.tips).innerHTML = this.target.tagName.toLowerCase();
    this.$('.id', this.overlay.tips).innerHTML = this.target.id ? `#${this.target.id}` : '';
    this.$('.class', this.overlay.tips).innerHTML = [...this.target.classList].map(item => `.${item}`).join('');
    this.$('.size', this.overlay.tips).innerHTML = `${marginLevel.width}x${marginLevel.height}`;

    let tipsTop = 0;
    if (elementInfo.top >= 24 + 8) {
      this.overlay.tips.classList.remove('reverse');
      tipsTop = elementInfo.top - 24 - 8;
    } else {
      this.overlay.tips.classList.add('reverse');
      tipsTop = marginLevel.height + elementInfo.top + 8;
    }
    addRule(this.overlay.tips, { top: `${tipsTop}px`, left: `${elementInfo.left}px`, display: 'block' });
  }

  handleClick(target) {
    this.listeners.forEach(listener => {
      listener(target);
    })
  }

  onClick(listener) {
    this.listeners.push(listener);
  }
}

export default DomInspector;
