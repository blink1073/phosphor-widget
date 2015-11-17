/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  Message, postMessage, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  MSG_AFTER_ATTACH, MSG_AFTER_SHOW, MSG_BEFORE_DETACH, MSG_BEFORE_HIDE,
  MSG_CLOSE_REQUEST, MSG_LAYOUT_REQUEST, MSG_UPDATE_REQUEST, ChildMessage,
  ResizeMessage, Widget, attachWidget, detachWidget
} from '../../lib/index';

import './index.css!';


class LogWidget extends Widget {

  messages: string[] = [];

  constructor(children?: Widget[]) {
    super();
    if (children) children.forEach(child => this.addChild(child));
  }

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


class VerboseWidget extends Widget {

  messages: Message[] = [];

  methods: string[] = [];

  constructor(children?: Widget[]) {
    super();
    if (children) children.forEach(child => this.addChild(child));
  }

  protected onChildAdded(msg: ChildMessage) {
    super.onChildAdded(msg);
    this.messages.push(msg);
    this.methods.push('onChildAdded');
  }

  protected onChildRemoved(msg: ChildMessage) {
    super.onChildRemoved(msg);
    this.messages.push(msg);
    this.methods.push('onChildRemoved');
  }

  protected onChildMoved(msg: ChildMessage) {
    super.onChildMoved(msg);
    this.messages.push(msg);
    this.methods.push('onChildMoved');
  }

  protected onResize(msg: ResizeMessage) {
    super.onResize(msg);
    this.messages.push(msg);
    this.methods.push('onResize');
  }

  protected onUpdateRequest(msg: Message) {
    super.onUpdateRequest(msg);
    this.messages.push(msg);
    this.methods.push('onUpdateRequest');
  }

  protected onLayoutRequest(msg: Message) {
    super.onLayoutRequest(msg);
    this.messages.push(msg);
    this.methods.push('onLayoutRequest');
  }

  protected onAfterShow(msg: Message) {
    super.onAfterShow(msg);
    this.messages.push(msg);
    this.methods.push('onAfterShow');
  }

  protected onBeforeHide(msg: Message) {
    super.onBeforeHide(msg);
    this.messages.push(msg);
    this.methods.push('onBeforeHide');
  }

  protected onAfterAttach(msg: Message) {
    super.onAfterAttach(msg);
    this.messages.push(msg);
    this.methods.push('onAfterAttach');
  }

  protected onBeforeDetach(msg: Message) {
    super.onBeforeDetach(msg);
    this.messages.push(msg);
    this.methods.push('onBeforeDetach');
  }

  protected onChildShown(msg: ChildMessage) {
    super.onChildShown(msg);
    this.messages.push(msg);
    this.methods.push('onChildShown');
  }

  protected onChildHidden(msg: ChildMessage) {
    super.onChildHidden(msg);
    this.messages.push(msg);
    this.methods.push('onChildHidden');
  }

  protected onCloseRequest(msg: Message) {
    super.onCloseRequest(msg);
    this.messages.push(msg);
    this.methods.push('onCloseRequest');
  }
}


describe('phosphor-widget', () => {

  describe('MSG_UPDATE_REQUEST', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_UPDATE_REQUEST instanceof Message).to.be(true);
    });

    it('should have a `type` of `update-request`', () => {
      expect(MSG_UPDATE_REQUEST.type).to.be('update-request');
    });

  });

  describe('MSG_LAYOUT_REQUEST', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_LAYOUT_REQUEST instanceof Message).to.be(true);
    });

    it('should have a `type` of `layout-request`', () => {
      expect(MSG_LAYOUT_REQUEST.type).to.be('layout-request');
    });

  });

  describe('MSG_AFTER_SHOW', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_AFTER_SHOW instanceof Message).to.be(true);
    });

    it('should have a `type` of `after-show`', () => {
      expect(MSG_AFTER_SHOW.type).to.be('after-show');
    });

  });

  describe('MSG_BEFORE_HIDE', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_BEFORE_HIDE instanceof Message).to.be(true);
    });

    it('should have a `type` of `before-hide`', () => {
      expect(MSG_BEFORE_HIDE.type).to.be('before-hide');
    });

  });

  describe('MSG_AFTER_ATTACH', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_AFTER_ATTACH instanceof Message).to.be(true);
    });

    it('should have a `type` of `after-attach`', () => {
      expect(MSG_AFTER_ATTACH.type).to.be('after-attach');
    });

  });

  describe('MSG_BEFORE_DETACH', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_BEFORE_DETACH instanceof Message).to.be(true);
    });

    it('should have a `type` of `before-detach`', () => {
      expect(MSG_BEFORE_DETACH.type).to.be('before-detach');
    });

  });

  describe('MSG_CLOSE_REQUEST', () => {

    it('should be a `Message` instance', () => {
      expect(MSG_CLOSE_REQUEST instanceof Message).to.be(true);
    });

    it('should have a `type` of `close-request`', () => {
      expect(MSG_CLOSE_REQUEST.type).to.be('close-request');
    });

  });

  describe('Widget', () => {

    describe('.p_Widget', () => {

      it('should equal `p-Widget`', () => {
        expect(Widget.p_Widget).to.be('p-Widget');
      });

    });

    describe('.p_mod_hidden', () => {

      it('should equal `p-mod-hidden`', () => {
        expect(Widget.p_mod_hidden).to.be('p-mod-hidden');
      });

    });

    describe('.disposedSignal', () => {

      it('should be a signal', () => {
        expect(Widget.disposedSignal instanceof Signal).to.be(true);
      });

    });

    describe('.hiddenProperty', () => {

      it('should be a property descriptor', () => {
        expect(Widget.hiddenProperty instanceof Property).to.be(true);
      });

      it('should default to `false`', () => {
        var widget = new Widget();
        expect(Widget.hiddenProperty.get(widget)).to.be(false);
      });

      it('should toggle the presence of `p-mod-hidden`', () => {
        var widget = new Widget();
        expect(widget.hasClass(Widget.p_mod_hidden)).to.be(false);
        Widget.hiddenProperty.set(widget, true);
        expect(widget.hasClass(Widget.p_mod_hidden)).to.be(true);
      });

      it('should dispatch an `after-show` message', () => {
        var widget = new LogWidget();
        Widget.hiddenProperty.set(widget, true);
        attachWidget(widget, document.body);
        expect(widget.messages.indexOf('after-show')).to.be(-1);
        Widget.hiddenProperty.set(widget, false);
        expect(widget.messages.indexOf('after-show')).to.not.be(-1);
        detachWidget(widget);
      });

      it('should dispatch a `before-hide` message', () => {
        var widget = new LogWidget();
        expect(widget.messages.indexOf('before-hide')).to.be(-1);
        attachWidget(widget, document.body);
        Widget.hiddenProperty.set(widget, true);
        expect(widget.messages.indexOf('before-hide')).to.not.be(-1);
        detachWidget(widget);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var widget = new Widget();
        expect(widget instanceof Widget).to.be(true);
      });

      it('should add the `p-Widget` class', () => {
        var widget = new Widget();
        expect(widget.hasClass(Widget.p_Widget)).to.be(true);
      });

    });

    describe('#dispose()', () => {

      it('should dispose of the widget', () => {
        var widget = new Widget();
        widget.dispose();
        expect(widget.isDisposed).to.be(true);
      });

      it('should be a no-op if the widget already disposed', () => {
        var called = false;
        var widget = new Widget();
        widget.dispose();
        widget.disposed.connect(() => called = true);
        widget.dispose();
        expect(called).to.be(false);
        expect(widget.isDisposed).to.be(true);
      });

      it('should dispose of the widget descendants', () => {
        var child = new Widget();
        var parent = new Widget();
        child.parent = parent;
        parent.dispose();
        expect(child.isDisposed).to.be(true);
      });

      it('should remove the widget from its parent', () => {
        var child = new Widget();
        var parent = new Widget();
        child.parent = parent;
        child.dispose();
        expect(parent.isDisposed).to.be(false);
        expect(child.isDisposed).to.be(true);
        expect(child.parent).to.be(null);
        expect(parent.children).to.eql([]);
      });

      it('should automatically detach the widget', () => {
        var widget = new Widget();
        attachWidget(widget, document.body);
        expect(widget.isAttached).to.be(true);
        widget.dispose();
        expect(widget.isAttached).to.be(false);
      });

    });

    describe('#disposed', () => {

      it('should be emitted when the widget is disposed', () => {
        var called = false;
        var widget = new Widget();
        widget.disposed.connect(() => { called = true; });
        widget.dispose();
        expect(called).to.be(true);
      });

    });

    describe('#isAttached', () => {

      it('should be `true` if the widget is attached', () => {
        var widget = new Widget();
        attachWidget(widget, document.body);
        expect(widget.isAttached).to.be(true);
      });

      it('should be `false` if the widget is not attached', () => {
        var widget = new Widget();
        expect(widget.isAttached).to.be(false);
      });

    });

    describe('#isDisposed', () => {

      it('should be `true` if the widget is disposed', () => {
        var widget = new Widget();
        widget.dispose();
        expect(widget.isDisposed).to.be(true);
      });

      it('should be `false` if the widget is not disposed', () => {
        var widget = new Widget();
        expect(widget.isDisposed).to.be(false);
      });

    });

    describe('#isVisible', () => {

      it('should be `true` if the widget is visible', () => {
        var widget = new Widget();
        attachWidget(widget, document.body);
        expect(widget.isVisible).to.be(true);
      });

      it('should be `false` if the widget is not visible', () => {
        var widget = new Widget();
        attachWidget(widget, document.body);
        widget.hidden = true;
        expect(widget.isVisible).to.be(false);
      });

      it('should be `false` if the widget is not attached', () => {
        var widget = new Widget();
        expect(widget.isVisible).to.be(false);
      });

    });

    describe('#hidden', () => {

      it('should be `true` if the widget is hidden', () => {
        var widget = new Widget();
        attachWidget(widget, document.body);
        widget.hidden = true;
        expect(widget.hidden).to.be(true);
      });

      it('should be `false` if the widget is not hidden', () => {
        var widget = new Widget();
        attachWidget(widget, document.body);
        expect(widget.hidden).to.be(false);
      });

      it('should be a pure delegate to the `hiddenProperty`', () => {
        var widget = new Widget();
        widget.hidden = true;
        expect(Widget.hiddenProperty.get(widget)).to.be(true);
        Widget.hiddenProperty.set(widget, false);
        expect(widget.hidden).to.be(false);
      });

    });

    describe('#boxSizing', () => {

      it('should be computed on the node', () => {
        var widget = new Widget();
        widget.addClass('box-sizing');
        attachWidget(widget, document.body);
        var sizing = widget.boxSizing;
        expect(sizing.borderTop).to.be(10);
        expect(sizing.borderLeft).to.be(15);
        expect(sizing.borderRight).to.be(0);
        expect(sizing.borderBottom).to.be(0);
        expect(sizing.paddingTop).to.be(15);
        expect(sizing.paddingLeft).to.be(12);
        expect(sizing.paddingRight).to.be(8);
        expect(sizing.paddingBottom).to.be(9);
        expect(sizing.verticalSum).to.be(34);
        expect(sizing.horizontalSum).to.be(35);
      });

      it('should be cached', () => {
        var widget = new Widget();
        widget.addClass('box-sizing');
        attachWidget(widget, document.body);
        var sizing = widget.boxSizing;
        expect(sizing.borderTop).to.be(10);
        widget.removeClass('box-sizing');
        var newSizing = widget.boxSizing;
        expect(newSizing.borderTop).to.be(10);
      });

      it('should be ready only', () => {
        var widget = new Widget();
        expect(() => { widget.boxSizing = null; }).to.throwError();
      });
    });

    describe('#sizeLimits', () => {

      it('should be computed on the node', () => {
        var widget = new Widget();
        widget.addClass('size-limits');
        attachWidget(widget, document.body);
        var limits = widget.sizeLimits;
        expect(limits.minWidth).to.be(90);
        expect(limits.minHeight).to.be(95);
        expect(limits.maxWidth).to.be(100);
        expect(limits.maxHeight).to.be(105);
      });

      it('should be read only', () => {
        var widget = new Widget();
        expect(() => { widget.sizeLimits = null; }).to.throwError();
      });
    });

    describe('#offsetRect', () => {

      it('should be computed on the node', () => {
        var widget = new Widget();
        widget.addClass('offset-rect');
        attachWidget(widget, document.body);
        var offsets = widget.offsetRect;
        expect(offsets.top).to.be(0);
        expect(offsets.left).to.be(0);
        expect(offsets.width).to.be(100);
        expect(offsets.height).to.be(100);
      });

      it('should be read only', () => {
        var widget = new Widget();
        expect(() => { widget.offsetRect = null; }).to.throwError();
      });

      it('should not read from the node if setOffsetGeometry has been called', () => {
        var widget = new Widget();
        widget.setOffsetGeometry(10, 10, 110, 110);
        widget.addClass('offset-rect');
        attachWidget(widget, document.body);
        var offsets = widget.offsetRect;
        expect(offsets.top).to.be(10);
        expect(offsets.left).to.be(10);
        expect(offsets.width).to.be(110);
        expect(offsets.height).to.be(110);
      });
    });

    describe('#parent', () => {

      it('should be the parent of the widget', () => {
        var child = new Widget();
        var parent = new Widget();
        child.parent = parent;
        expect(child.parent).to.be(parent);
        expect(parent.children).to.eql([child]);
      });

      it('should be `null` if the widget has no parent', () => {
        var widget = new Widget();
        expect(widget.parent).to.be(null);
      });

      it('should unparent the widget when set to `null`', () => {
        var child = new Widget();
        var parent = new Widget();
        child.parent = parent;
        child.parent = null;
        expect(child.parent).to.be(null);
        expect(parent.children).to.eql([]);
      });

      it('should reparent the widget when set to not `null`', () => {
        var child = new Widget();
        var parent1 = new Widget();
        var parent2 = new Widget();
        child.parent = parent1;
        child.parent = parent2;
        expect(child.parent).to.be(parent2);
        expect(parent1.children).to.eql([]);
        expect(parent2.children).to.eql([child]);
      });

      it('should be a no-op if the parent does not change', () => {
        var child = new Widget();
        var parent = new Widget();
        child.parent = parent;
        child.parent = parent;
        expect(child.parent).to.be(parent);
        expect(parent.children).to.eql([child]);
      });

      it('should throw an error if the widget is used as its parent', () => {
        var widget = new Widget();
        expect(() => { widget.parent = widget; }).to.throwError();
      });

    });

    describe('#children', () => {

      it('should be an empty array if there are no children', () => {
        var widget = new Widget();
        expect(widget.children).to.eql([]);
      });

      it('should return a shallow copy of the children', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        var children = [child0, child1];
        parent.children = children;
        expect(parent.children).to.not.be(children);
        expect(parent.children).to.eql(children);
      });

      it('should clear the existing children and add the new children when set', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var child2 = new Widget();
        var child3 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        parent.children = [child2, child3];
        expect(parent.children).to.eql([child2, child3]);
        expect(child0.parent).to.be(null);
        expect(child1.parent).to.be(null);
        expect(child2.parent).to.be(parent);
        expect(child3.parent).to.be(parent);
      });

    });

    describe('#childCount', () => {

      it('should return the current number of children', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        expect(parent.childCount).to.be(0);
        parent.children = [child0, child1];
        expect(parent.childCount).to.be(2);
      });

      it('should be a read-only property', () => {
        var widget = new Widget();
        expect(() => { widget.childCount = 2; }).to.throwError();
      });

    });

    describe('#childAt()', () => {

      it('should return the child at the given index', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        expect(parent.childAt(0)).to.be(child0);
        expect(parent.childAt(1)).to.be(child1);
      });

      it('should return `undefined` if the index is out of range', () => {
        var child = new Widget();
        var parent = new Widget();
        child.parent = parent;
        expect(parent.childAt(1)).to.be(void 0);
      });

    });

    describe('#childIndex()', () => {

      it('should return the index of the given child', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        expect(parent.childIndex(child0)).to.be(0);
        expect(parent.childIndex(child1)).to.be(1);
      });

      it('should return `-1` if the widget does not contain the child', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        child0.parent = parent;
        expect(parent.childIndex(child1)).to.be(-1);
      });

    });

    describe('#addChild()', () => {

      it('should add a child widget to the end of the children', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        child0.parent = parent;
        parent.addChild(child1);
        expect(parent.children).to.eql([child0, child1]);
      });

      it('should return the new index of the child', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        child0.parent = parent;
        expect(parent.addChild(child1)).to.be(1);
      });

      it('should throw an error if the widget is added to itself', () => {
        var widget = new Widget();
        expect(() => { widget.addChild(widget); }).to.throwError();
      });

      it('should reparent the child if appropriate', () => {
        var child = new Widget();
        var parent1 = new Widget();
        var parent2 = new Widget();
        child.parent = parent1;
        parent2.addChild(child);
        expect(child.parent).to.be(parent2);
        expect(parent2.children).to.eql([child]);
        expect(parent1.children).to.eql([]);
      });

      it('should first detach the child if appropriate', () => {
        var child = new LogWidget();
        var parent = new Widget();
        attachWidget(child, document.body);
        child.messages = [];
        parent.addChild(child);
        expect(child.messages[0]).to.be('before-detach');
      });

    });

    describe('#insertChild()', () => {

      it('should insert a child widget at a given index', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        child0.parent = parent;
        parent.insertChild(0, child1);
        expect(parent.children).to.eql([child1, child0]);
      });

      it('should return the new index of the child', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        child0.parent = parent;
        expect(parent.insertChild(0, child1)).to.be(0);
      });

      it('should clamp the index to the bounds of the children', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var child2 = new Widget();
        var parent = new Widget();
        child0.parent = parent;
        expect(parent.insertChild(2, child1)).to.be(1);
        expect(parent.insertChild(-1, child2)).to.be(0);
      });

      it('should throw an error if the widget is added to itself', () => {
        var widget = new Widget();
        expect(() => { widget.insertChild(0, widget); }).to.throwError();
      });

      it('should reparent the child if appropriate', () => {
        var child = new Widget();
        var parent1 = new Widget();
        var parent2 = new Widget();
        child.parent = parent1;
        parent2.insertChild(0, child);
        expect(child.parent).to.be(parent2);
        expect(parent2.children).to.eql([child]);
        expect(parent1.children).to.eql([]);
      });

      it('should first detach the child if appropriate', () => {
        var child = new LogWidget();
        var parent = new Widget();
        attachWidget(child, document.body);
        child.messages = [];
        parent.insertChild(0, child);
        expect(child.messages[0]).to.be('before-detach');
      });

    });

    describe('#moveChild()', () => {

      it('should move a child from one index to another', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        parent.moveChild(1, 0);
        expect(parent.childAt(0)).to.be(child1);
        expect(parent.childAt(1)).to.be(child0);
      });

      it('should return `true` if the move was successful', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        expect(parent.moveChild(1, 0)).to.be(true);
        expect(parent.moveChild(0, 1)).to.be(true);
      });

      it('should return `false` if either index is out of range', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        expect(parent.moveChild(-1, 0)).to.be(false);
        expect(parent.moveChild(2, 0)).to.be(false);
        expect(parent.moveChild(0, -1)).to.be(false);
        expect(parent.moveChild(0, 2)).to.be(false);
      });

    });

    describe('#removeChildAt()', () => {

      it('should remove the child at the given index', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var child2 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        parent.removeChildAt(0);
        expect(parent.children).to.eql([child1]);
        parent.children = [child0, child1, child2]
        parent.removeChildAt(1);
        expect(parent.children).to.eql([child0, child2]);
      });

      it('should return the removed child', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        expect(parent.removeChildAt(0)).to.be(child0);
      });

      it('should return `undefined` if the index is out of range', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        expect(parent.removeChildAt(-1)).to.be(void 0);
        expect(parent.removeChildAt(2)).to.be(void 0);
      });

    });

    describe('#removeChild()', () => {

      it('should remove the given child widget', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        parent.removeChild(child0);
        expect(parent.childCount).to.be(1);
        expect(parent.children).to.eql([child1]);
      });

      it('should return the index occupied by the child', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        expect(parent.removeChild(child1)).to.be(1);
      });

      it('should return `-1` if the widget does not contain the child', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        child0.parent = parent;
        expect(parent.removeChild(child1)).to.be(-1);
      });

    });

    describe('#clearChildren()', () => {

      it('should remove all children', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new Widget();
        parent.children = [child0, child1];
        parent.clearChildren();
        expect(parent.childCount).to.be(0);
      });

    });

    describe('#update()', () => {

      it('should post an `update-request` message by default', (done) => {
        var widget = new LogWidget();
        widget.update();
        expect(widget.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['update-request']);
          done();
        });
      });

      it('should send an `update-request` if `immediate` is `true`', () => {
        var widget = new LogWidget();
        widget.update(true);
        expect(widget.messages).to.eql(['update-request']);
      });

      it('should post an `update-request` if `immediate` is `false`', (done) => {
        var widget = new LogWidget();
        widget.update(false);
        expect(widget.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['update-request']);
          done();
        });
      });

    });

    describe('#close()', () => {

      it('should post a `close-request` message by default', (done) => {
        var widget = new LogWidget();
        widget.close();
        expect(widget.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['close-request']);
          done();
        });
      });

      it('should send a `close-request` if `immediate` is `true`', () => {
        var widget = new LogWidget();
        widget.close(true);
        expect(widget.messages).to.eql(['close-request']);
      });

      it('should post a `close-request` if `immediate` is `false`', (done) => {
        var widget = new LogWidget();
        widget.close(false);
        expect(widget.messages).to.eql([]);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['close-request']);
          done();
        });
      });

    });

    describe('#clearBoxSizing()', () => {

      it('should clear the boxSizing cache', () => {
        var widget = new Widget();
        widget.addClass('box-sizing');
        attachWidget(widget, document.body);
        var sizing = widget.boxSizing;
        expect(sizing.borderTop).to.be(10);
        widget.clearBoxSizing();
        widget.removeClass('box-sizing');
        var newSizing = widget.boxSizing;
        expect(newSizing.borderTop).to.be(0);
      });

      it('should be a no-op if there is no stored cache', () => {
        var widget = new Widget();
        widget.clearBoxSizing();
      });

    });

    describe('#setSizeLimits()', () => {

      it('should set the size limits for the widget', () => {
        var widget = new Widget();
        widget.setSizeLimits(94, 84, 99, 104);
        var limits = widget.sizeLimits;
        expect(limits.minWidth).to.be(94);
        expect(limits.minHeight).to.be(84);
        expect(limits.maxWidth).to.be(99);
        expect(limits.maxHeight).to.be(104);
      });

      it('should be cached', () => {
        var widget = new Widget();
        widget.setSizeLimits(94, 84, 99, 104);
        var limits = widget.sizeLimits;
        expect(limits.minWidth).to.be(94);
        widget.addClass('size-limits');
        var newLimits = widget.sizeLimits;
        expect(newLimits.minWidth).to.be(94);
      });

    });

    describe('#clearSizeLimits()', () => {

      it('should clear the cached size limits for the widget', () => {
        var widget = new Widget();
        widget.setSizeLimits(94, 84, 99, 104);
        var limits = widget.sizeLimits;
        expect(limits.minWidth).to.be(94);
        widget.addClass('size-limits');
        widget.clearSizeLimits();
        var newLimits = widget.sizeLimits;
        expect(newLimits.minWidth).to.be(90);
      });

      it('should be a no-op if there is no stored cache', () => {
        var widget = new Widget();
        widget.clearSizeLimits();
      });

    });

    describe('#setOffsetGeometry()', () => {

      it('should set the offest geometry for the widget', () => {
        var widget = new Widget();
        widget.setOffsetGeometry(5, 5, 105, 105);
        attachWidget(widget, document.body);
        var offsets = widget.offsetRect;
        expect(offsets.top).to.be(5);
        expect(offsets.left).to.be(5);
        expect(offsets.width).to.be(105);
        expect(offsets.height).to.be(105);
      });

      it('should update the inline style of the node', () => {
        var widget = new Widget();
        widget.setOffsetGeometry(5, 5, 105, 105);
        attachWidget(widget, document.body);
        var offsets = widget.offsetRect;
        expect(offsets.top).to.be(5);
        widget.addClass('offset-rect');
        var newOffset = widget.offsetRect;
        expect(offsets.top).to.be(5);
      });

    });

    describe('#clearOffsetGeometry()', () => {

      it('should clear the inline geometry', () => {
        var widget = new Widget();
        widget.setOffsetGeometry(5, 5, 105, 105);
        attachWidget(widget, document.body);
        var offsets = widget.offsetRect;
        expect(offsets.top).to.be(5);
        widget.addClass('offset-rect');
        widget.clearOffsetGeometry();
        var newOffsets = widget.offsetRect;
        expect(newOffsets.top).to.be(0);
      });

      it('should be a no-op if the geometry was not set', () => {
        var widget = new Widget();
        widget.clearOffsetGeometry();
      });

    });

    describe('#compressMessage()', () => {

      it('should compress `update-request` messages', (done) => {
        var widget = new LogWidget();
        postMessage(widget, MSG_UPDATE_REQUEST);
        postMessage(widget, MSG_UPDATE_REQUEST);
        postMessage(widget, MSG_UPDATE_REQUEST);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['update-request']);
          done();
        });
      });

      it('should compress `layout-request` messages', (done) => {
        var widget = new LogWidget();
        postMessage(widget, MSG_LAYOUT_REQUEST);
        postMessage(widget, MSG_LAYOUT_REQUEST);
        postMessage(widget, MSG_LAYOUT_REQUEST);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['layout-request']);
          done();
        });
      });

      it('should compress `close-request` messages', (done) => {
        var widget = new LogWidget();
        postMessage(widget, MSG_CLOSE_REQUEST);
        postMessage(widget, MSG_CLOSE_REQUEST);
        postMessage(widget, MSG_CLOSE_REQUEST);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['close-request']);
          done();
        });
      });

      it('should not compress other messages', (done) => {
        var widget = new LogWidget();
        var msg = new Message('foo');
        postMessage(widget, msg);
        postMessage(widget, msg);
        postMessage(widget, msg);
        requestAnimationFrame(() => {
          expect(widget.messages).to.eql(['foo', 'foo', 'foo']);
          done();
        });
      });

    });

    describe('#onChildAdded()', () => {

      it('should be invoked when a child is added', () => {
        var child = new Widget();
        var parent = new VerboseWidget();
        parent.addChild(child);
        expect(parent.methods[0]).to.be('onChildAdded');
      });

      it('should insert the child node at the current location', () => {
        var child0 = new Widget();
        var child1 = new Widget();
        var parent = new VerboseWidget([child0]);
        parent.insertChild(0, child1);
        expect(parent.messages[0].type).to.be('child-added');
        expect(parent.children[0]).to.be(child1);
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          expect(parent.messages[0] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-added`', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          expect(parent.messages[0].type).to.be('child-added');
        });

        it('should have the correct `child`', () => {
          var child0 = new Widget();
          var child1 = new Widget();
          var parent = new VerboseWidget([child0]);
          parent.messages = [];
          parent.addChild(child1);
          expect((<ChildMessage>parent.messages[0]).child).to.be(child1);
        });

        it('should have the correct `currentIndex`', () => {
          var child0 = new Widget();
          var child1 = new Widget();
          var parent = new VerboseWidget([child0]);
          expect((<ChildMessage>parent.messages[0]).currentIndex).to.be(0);
          parent.addChild(child1);
          expect((<ChildMessage>parent.messages[1]).currentIndex).to.be(1);
        });

        it('should have a `previousIndex` of `-1`', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          expect((<ChildMessage>parent.messages[0]).previousIndex).to.be(-1);
        });

      });

      context('if the widget is attached', () => {

        it('should send an `after-attach` message to the child', () => {
          var child = new LogWidget();
          var parent = new VerboseWidget();
          attachWidget(parent, document.body);
          parent.addChild(child);
          expect(child.messages[0]).to.be('after-attach');
        });

      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child is removed', () => {
        var child = new Widget();
        var parent = new VerboseWidget([child]);
        parent.removeChild(child);
        expect(parent.methods[1]).to.be('onChildRemoved');
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
           var child = new Widget();
           var parent = new VerboseWidget([child]);
           parent.removeChild(child);
           expect(parent.messages[1] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-removed`', () => {
           var child = new Widget();
           var parent = new VerboseWidget([child]);
           parent.removeChild(child);
           expect(parent.messages[1].type).to.be('child-removed');
        });

        it('should have the correct `child`', () => {
           var child0 = new Widget();
           var child1 = new Widget();
           var parent = new VerboseWidget([child0, child1]);
           parent.messages = []
           parent.removeChild(child1);
           expect((<ChildMessage>parent.messages[0]).child).to.be(child1);
        });

        it('should have a `currentIndex` of -1', () => {
           var child = new Widget();
           var parent = new VerboseWidget([child]);
           parent.removeChild(child);
           expect((<ChildMessage>parent.messages[1]).currentIndex).to.be(-1);
        });

        it('should have the correct `previousIndex`', () => {
           var child0 = new Widget();
           var child1 = new Widget();
           var parent = new VerboseWidget([child0, child1]);
           parent.messages = []
           parent.removeChild(child1);
           parent.removeChild(child0);
           expect((<ChildMessage>parent.messages[0]).previousIndex).to.be(1);
           expect((<ChildMessage>parent.messages[1]).previousIndex).to.be(0);
        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {
          var child = new LogWidget();
          var parent = new VerboseWidget([child]);
          attachWidget(parent, document.body);
          parent.removeChild(child);
          expect(child.messages[1]).to.be('before-detach');
        });

      });

    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', () => {
         var child0 = new Widget();
         var child1 = new Widget();
         var parent = new VerboseWidget([child0, child1]);
         parent.methods = [];
         parent.moveChild(1, 0);
         expect(parent.methods[0]).to.be('onChildMoved');
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
         var child0 = new Widget();
         var child1 = new Widget();
         var parent = new VerboseWidget([child0, child1]);
         parent.messages = [];
         parent.moveChild(1, 0);
         expect(parent.messages[0] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-moved`', () => {
         var child0 = new Widget();
         var child1 = new Widget();
         var parent = new VerboseWidget([child0, child1]);
         parent.messages = [];
         parent.moveChild(1, 0);
         expect(parent.messages[0].type).to.be('child-moved');
        });

        it('should have the correct `child`', () => {
         var child0 = new Widget();
         var child1 = new Widget();
         var parent = new VerboseWidget([child0, child1]);
         parent.messages = [];
         parent.moveChild(1, 0);
         expect((<ChildMessage>parent.messages[0]).child).to.be(child1);
        });

        it('should have the correct `currentIndex`', () => {
         var child0 = new Widget();
         var child1 = new Widget();
         var parent = new VerboseWidget([child0, child1]);
         parent.messages = [];
         parent.moveChild(1, 0);
         expect((<ChildMessage>parent.messages[0]).currentIndex).to.be(0);
        });

        it('should have the correct `previousIndex`', () => {
         var child0 = new Widget();
         var child1 = new Widget();
         var parent = new VerboseWidget([child0, child1]);
         parent.messages = [];
         parent.moveChild(1, 0);
         expect((<ChildMessage>parent.messages[0]).previousIndex).to.be(1);
        });

      });

      context('if the widget is attached', () => {

        it('should send a `before-detach` message to the child', () => {
          var child0 = new LogWidget();
          var child1 = new LogWidget();
          var parent = new VerboseWidget([child0, child1]);
          attachWidget(parent, document.body);
          parent.moveChild(1, 0);
          expect(child1.messages.indexOf('before-detach')).to.not.be(-1);
        });

        it('should send an `after-attach` message to the child', () => {
          var child0 = new LogWidget();
          var child1 = new LogWidget();
          var parent = new VerboseWidget([child0, child1]);
          attachWidget(parent, document.body);
          parent.moveChild(1, 0);
          expect(child1.messages.indexOf('after-attach')).to.not.be(-1);
        });

      });

    });

    describe('#onResize()', () => {

      it('should be invoked when the widget is resized', () => {
        var widget = new VerboseWidget();
        attachWidget(widget, document.body);
        widget.methods = [];
        sendMessage(widget, ResizeMessage.UnknownSize);
        expect(widget.methods[0]).to.be('onResize');
      });

      context('`msg` parameter', () => {

        it('should be a `ResizeMessage`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          widget.messages = [];
          sendMessage(widget, ResizeMessage.UnknownSize);
          expect(widget.messages[0] instanceof ResizeMessage).to.be(true);
        });

        it('should have a `type` of `resize`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          widget.messages = [];
          sendMessage(widget, ResizeMessage.UnknownSize);
          expect(widget.messages[0].type).to.be('resize');
        });

      });

      it('should dispatch `ResizeMessage.UnknownSize` to the children', () => {
        var child0 = new VerboseWidget();
        var child1 = new VerboseWidget();
        var parent = new Widget();
        parent.children = [child0, child1];
        child0.messages = [];
        child1.messages = [];
        sendMessage(parent, ResizeMessage.UnknownSize);
        expect(child0.messages[0]).to.eql(ResizeMessage.UnknownSize);
        expect(child1.messages[0]).to.eql(ResizeMessage.UnknownSize);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked when an update is requested', () => {
        var widget = new VerboseWidget();
        sendMessage(widget, MSG_UPDATE_REQUEST);
        expect(widget.methods[0]).to.be('onUpdateRequest');
      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {
          var widget = new VerboseWidget();
          sendMessage(widget, MSG_UPDATE_REQUEST);
          expect(widget.messages[0] instanceof Message).to.be(true);
        });

        it('should have a `type` of `update-request`', () => {
          var widget = new VerboseWidget();
          sendMessage(widget, MSG_UPDATE_REQUEST);
          expect(widget.messages[0].type).to.be('update-request');
        });

      });

      it('should dispatch `ResizeMessage.UnknownSize` to the children', () => {
        var child0 = new VerboseWidget();
        var child1 = new VerboseWidget();
        var parent = new Widget();
        parent.children = [child0, child1];
        child0.messages = [];
        child1.messages = [];
        sendMessage(parent, MSG_UPDATE_REQUEST);
        expect(child0.messages[0]).to.eql(ResizeMessage.UnknownSize);
        expect(child1.messages[0]).to.eql(ResizeMessage.UnknownSize);
      });

    });

    describe('#onLayoutRequest()', () => {

      it('should be invoked when a layout is requested', () => {
        var widget = new VerboseWidget();
        sendMessage(widget, MSG_LAYOUT_REQUEST);
        expect(widget.methods[0]).to.be('onLayoutRequest');
      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {
          var widget = new VerboseWidget();
          sendMessage(widget, MSG_LAYOUT_REQUEST);
          expect(widget.messages[0] instanceof Message).to.be(true);
        });

        it('should have a `type` of `layout-request`', () => {
          var widget = new VerboseWidget();
          sendMessage(widget, MSG_LAYOUT_REQUEST);
          expect(widget.messages[0].type).to.be('layout-request');
        });

      });

    });

    describe('#onAfterShow()', () => {

      it('should be invoked just after the widget is made visible', () => {
        var widget = new VerboseWidget();
        attachWidget(widget, document.body);
        widget.hidden = true;
        widget.hidden = false;
        expect(widget.methods.indexOf('onAfterShow')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          widget.hidden = true;
          widget.hidden = false;
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg instanceof Message).to.be(true);
        });

        it('should have a `type` of `after-show`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          widget.hidden = true;
          widget.hidden = false;
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg.type).to.be('after-show');
        });

      });

    });

    describe('#onBeforeHide()', () => {

      it('should be invoked just before the widget is made not-visible', () => {
        var widget = new VerboseWidget();
        attachWidget(widget, document.body);
        widget.hidden = true;
        expect(widget.methods.indexOf('onBeforeHide')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          widget.hidden = true;
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg instanceof Message).to.be(true);
        });

        it('should have a `type` of `before-hide`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          widget.hidden = true;
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg.type).to.be('before-hide');
        });

      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked just after the widget is attached', () => {
        var widget = new VerboseWidget();
        attachWidget(widget, document.body);
        expect(widget.methods.indexOf('onAfterAttach')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg instanceof Message).to.be(true);
        });

        it('should have a `type` of `after-attach`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg.type).to.be('after-attach');
        });

      });

    });

    describe('#onBeforeDetach()', () => {

      it('should be invoked just before the widget is detached', () => {
        var widget = new VerboseWidget();
        attachWidget(widget, document.body);
        detachWidget(widget);
        expect(widget.methods.indexOf('onBeforeDetach')).to.not.be(-1);
      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          detachWidget(widget);
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg instanceof Message).to.be(true);
        });

        it('should have a `type` of `before-detach`', () => {
          var widget = new VerboseWidget();
          attachWidget(widget, document.body);
          detachWidget(widget);
          var msg = widget.messages[widget.messages.length - 1];
          expect(msg.type).to.be('before-detach');
        });

      });

    });

    describe('#onChildShown()', () => {

      it('should be invoked when a child is unhidden', () => {
        var child = new Widget();
        var parent = new VerboseWidget([child]);
        attachWidget(parent, document.body);
        parent.hidden = true;
        child.hidden = true;
        parent.hidden = false;
        parent.methods = [];
        child.hidden = false;
        expect(parent.methods[0]).to.be('onChildShown');
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          attachWidget(parent, document.body);
          parent.hidden = true;
          child.hidden = true;
          parent.hidden = false;
          parent.messages = [];
          child.hidden = false;
          expect(parent.messages[0] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-shown`', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          attachWidget(parent, document.body);
          parent.hidden = true;
          child.hidden = true;
          parent.hidden = false;
          parent.messages = [];
          child.hidden = false;
          expect(parent.messages[0].type).to.be('child-shown');
        });

        it('should have the correct `child`', () => {
          var child0 = new Widget();
          var child1 = new Widget();
          var parent = new VerboseWidget([child0, child1]);
          attachWidget(parent, document.body);
          parent.hidden = true;
          child1.hidden = true;
          parent.hidden = false;
          parent.messages = [];
          child1.hidden = false;
          expect((<ChildMessage>parent.messages[0]).child).to.be(child1);
        });

        it('should have a `currentIndex` of -1', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          attachWidget(parent, document.body);
          parent.hidden = true;
          child.hidden = true;
          parent.hidden = false;
          parent.messages = [];
          child.hidden = false;
          expect((<ChildMessage>parent.messages[0]).currentIndex).to.be(-1);
        });

        it('should have a `previousIndex` of -1', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          attachWidget(parent, document.body);
          parent.hidden = true;
          child.hidden = true;
          parent.hidden = false;
          parent.messages = [];
          child.hidden = false;
          expect((<ChildMessage>parent.messages[0]).previousIndex).to.be(-1);
        });

      });

    });

    describe('#onChildHidden()', () => {

      it('should be invoked on a `child-hidden`', () => {
        var child = new Widget();
        var parent = new VerboseWidget([child]);
        parent.methods = [];
        child.hidden = true;
        expect(parent.methods[0]).to.be('onChildHidden');
      });

      context('`msg` parameter', () => {

        it('should be a `ChildMessage`', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          parent.messages = [];
          child.hidden = true;
          expect(parent.messages[0] instanceof ChildMessage).to.be(true);
        });

        it('should have a `type` of `child-hidden`', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          parent.messages = [];
          child.hidden = true;
          expect(parent.messages[0].type).to.be('child-hidden');
        });

        it('should have the correct `child`', () => {
          var child0 = new Widget();
          var child1 = new Widget();
          var parent = new VerboseWidget([child0, child1]);
          parent.messages = [];
          child0.hidden = true;
          expect((<ChildMessage>parent.messages[0]).child).to.be(child0);
        });

        it('should have a `currentIndex` of -1', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          parent.messages = [];
          child.hidden = true;
          expect((<ChildMessage>parent.messages[0]).currentIndex).to.be(-1);
        });

        it('should have a `previousIndex` of -1', () => {
          var child = new Widget();
          var parent = new VerboseWidget([child]);
          parent.messages = [];
          child.hidden = true;
          expect((<ChildMessage>parent.messages[0]).previousIndex).to.be(-1);
        });

      });

    });

    describe('#onCloseRequest()', () => {

      it('should be invoked on a `close-request`', () => {
        var widget = new VerboseWidget();
        sendMessage(widget, MSG_CLOSE_REQUEST);
        expect(widget.methods[0]).to.be('onCloseRequest');
      });

      context('`msg` parameter', () => {

        it('should be a `Message`', () => {
          var widget = new VerboseWidget();
          sendMessage(widget, MSG_CLOSE_REQUEST);
          expect(widget.messages[0] instanceof Message).to.be(true);
        });

        it('should have a `type` of `close-request`', () => {
          var widget = new VerboseWidget();
          sendMessage(widget, MSG_CLOSE_REQUEST);
          expect(widget.messages[0].type).to.be('close-request');
        });

      });

      it('should unparent a child widget by default', () => {
        var parent = new Widget();
        var child = new Widget();
        child.parent = parent;
        sendMessage(child, MSG_CLOSE_REQUEST);
        expect(child.parent).to.be(null);
        expect(parent.children).to.eql([]);
      });

      it('should detach a root widget by default', () => {
        var widget = new Widget();
        attachWidget(widget, document.body);
        sendMessage(widget, MSG_CLOSE_REQUEST);
        expect(widget.isAttached).to.be(false);
      });

    });

    context('message propagation', () => {

      it('should propagate `after-attach` to all descendants', () => {
        var bottom0 = new LogWidget();
        var bottom1 = new LogWidget();
        var middle = new LogWidget([bottom0, bottom1]);
        var top = new LogWidget([middle]);
        attachWidget(top, document.body);
        expect(bottom0.messages.indexOf('after-attach')).to.not.be(-1);
        expect(bottom1.messages.indexOf('after-attach')).to.not.be(-1);
        expect(middle.messages.indexOf('after-attach')).to.not.be(-1);
        expect(top.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('should propagate `before-detach` to all descendants', () => {
        var bottom0 = new LogWidget();
        var bottom1 = new LogWidget();
        var middle = new LogWidget([bottom0, bottom1]);
        var top = new LogWidget([middle]);
        attachWidget(top, document.body);
        detachWidget(top);
        expect(bottom0.messages.indexOf('before-detach')).to.not.be(-1);
        expect(bottom1.messages.indexOf('before-detach')).to.not.be(-1);
        expect(middle.messages.indexOf('before-detach')).to.not.be(-1);
        expect(top.messages.indexOf('before-detach')).to.not.be(-1);
      });

      it('should propagate `after-show` to all non-hidden descendants', () => {
        var bottom0 = new LogWidget();
        var bottom1 = new LogWidget();
        var middle = new LogWidget([bottom0, bottom1]);
        var top = new LogWidget([middle]);
        bottom0.hidden = true;
        top.hidden = true;
        attachWidget(top, document.body);
        top.hidden = false;
        expect(bottom0.messages.indexOf('after-show')).to.be(-1);
        expect(bottom1.messages.indexOf('after-show')).to.not.be(-1);
        expect(middle.messages.indexOf('after-show')).to.not.be(-1);
        expect(top.messages.indexOf('after-show')).to.not.be(-1);
        top.hidden = true;
        top.hidden = false;
        expect(bottom0.messages.indexOf('after-show')).to.be(-1);
      });

      it('should propagate `before-hide` to all non-hidden descendants', () => {
        var bottom0 = new LogWidget();
        bottom0.hidden = true;
        var bottom1 = new LogWidget();
        var middle = new LogWidget([bottom0, bottom1]);
        var top = new LogWidget([middle]);
        attachWidget(top, document.body);
        bottom0.messages = [];
        middle.hidden = true;
        expect(bottom0.messages.indexOf('before-hide')).to.be(-1);
        expect(bottom1.messages.indexOf('before-hide')).to.not.be(-1);
        expect(middle.messages.indexOf('before-hide')).to.not.be(-1);
        expect(top.messages.indexOf('before-hide')).to.be(-1);
        middle.messages = [];
        top.hidden = true;
        expect(middle.messages.indexOf('before-hide')).to.be(-1);
      });

    });

    context('state propagation', () => {

      it('should propagate `isAttached` state to all descendants', () => {
        var bottom0 = new LogWidget();
        var bottom1 = new LogWidget();
        var middle = new LogWidget([bottom0, bottom1]);
        var top = new LogWidget([middle]);
        expect(bottom0.isAttached).to.be(top.isAttached);
        expect(bottom1.isAttached).to.be(top.isAttached);
        expect(middle.isAttached).to.be(top.isAttached);
        attachWidget(top, document.body);
        expect(top.isAttached).to.be(true);
        expect(bottom0.isAttached).to.be(top.isAttached);
        expect(bottom1.isAttached).to.be(top.isAttached);
        expect(middle.isAttached).to.be(top.isAttached);
      });

      it('should propagate `isVisible` state to all non-hidden descendants', () => {
        var bottom0 = new LogWidget();
        bottom0.hidden = true;
        var bottom1 = new LogWidget();
        var middle = new LogWidget([bottom0, bottom1]);
        var top = new LogWidget([middle]);
        attachWidget(top, document.body);
        expect(top.isVisible).to.be(true);
        expect(bottom0.isVisible).to.be(false);
        expect(bottom1.isVisible).to.be(top.isVisible);
        expect(middle.isVisible).to.be(top.isVisible);
        top.hidden = true;
        expect(top.isVisible).to.be(false);
        expect(bottom0.isVisible).to.be(false);
        expect(bottom1.isVisible).to.be(top.isVisible);
        expect(middle.isVisible).to.be(top.isVisible);
      });

    });

  });

  describe('attachWidget()', () => {

    it('should attach a root widget to a host', () => {
      var widget = new Widget();
      expect(widget.isAttached).to.be(false);
      attachWidget(widget, document.body);
      expect(widget.isAttached).to.be(true);
    });

    it('should throw if the widget is not a root', () => {
      var widget = new Widget();
      var child = new Widget();
      child.parent = widget;
      expect(() => attachWidget(child, document.body)).to.throwError();
    });

    it('should throw if the widget is already attached', () => {
      var widget = new Widget();
      attachWidget(widget, document.body);
      expect(() => attachWidget(widget, document.body)).to.throwError();
    });

    it('should throw if the host is not attached to the DOM', () => {
      var widget = new Widget();
      var host = document.createElement('div');
      expect(() => attachWidget(widget, host)).to.throwError();
    });

    it('should dispatch an `after-attach` message', () => {
      var widget = new LogWidget();
      expect(widget.isAttached).to.be(false);
      expect(widget.messages.indexOf('after-attach')).to.be(-1);
      attachWidget(widget, document.body);
      expect(widget.isAttached).to.be(true);
      expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
    });

  });

  describe('detachWidget()', () => {

    it('should detach a root widget from its host', () => {
      var widget = new Widget();
      attachWidget(widget, document.body);
      expect(widget.isAttached).to.be(true);
      detachWidget(widget);
      expect(widget.isAttached).to.be(false);
    });

    it('should throw if the widget is not a root', () => {
      var child = new Widget();
      var parent = new Widget();
      child.parent = parent;
      attachWidget(parent, document.body);
      expect(() => { detachWidget(child); }).to.throwError();
    });

    it('should throw if the widget is not attached', () => {
      var widget = new Widget();
      expect(() => { detachWidget(widget); }).to.throwError();
    });

    it('should dispatch a `before-detach` message', () => {
      var widget = new LogWidget();
      attachWidget(widget, document.body);
      widget.messages = []
      detachWidget(widget);
      expect(widget.messages[0]).to.be('before-detach');
    });

  });

  describe('ChildMessage', () => {

    describe('#constructor()', () => {

      it('should accept the message type and child widget', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget);
        expect(msg instanceof ChildMessage).to.be(true);
      });

      it('should accept an optional `previousIndex`', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget, 1);
        expect(msg instanceof ChildMessage).to.be(true);
      });

      it('should accept an optional `currentIndex`', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget, 1, 0);
        expect(msg instanceof ChildMessage).to.be(true);
      });

      it('should default the `previousIndex` to `-1`', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget);
        expect(msg.previousIndex).to.be(-1);
      });

      it('should default the `currentIndex` to `-1`', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget, 1);
        expect(msg.currentIndex).to.be(-1);
      });

    });

    describe('#child', () => {

      it('should be the child passed to the constructor', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget);
        expect(msg.child).to.be(widget);
      });

      it('should be a read-only property', () => {
        var widget0 = new Widget();
        var widget1 = new Widget();
        var msg = new ChildMessage('test', widget0);
        expect(() => { msg.child = widget1; }).to.throwError();
      });

    });

    describe('#currentIndex', () => {

      it('should be the index provided to the constructor', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget, 1, 2);
        expect(msg.currentIndex).to.be(2);
      });

      it('should be a read-only property', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget, 1, 2);
        expect(() => { msg.currentIndex = 1; }).to.throwError();
      });

    });

    describe('#previousIndex', () => {

      it('should be the index provided to the constructor', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget, 2);
        expect(msg.previousIndex).to.be(2);
      });

      it('should be a read-only property', () => {
        var widget = new Widget();
        var msg = new ChildMessage('test', widget, 1, 2);
        expect(() => { msg.previousIndex = 0; }).to.throwError();
      });

    });

  });

  describe('ResizeMessage', () => {

    describe('.UnknownSize', () => {

      it('should be a `ResizeMessage`', () => {
        var msg = ResizeMessage.UnknownSize;
        expect(msg instanceof ResizeMessage).to.be(true);
      });

      it('should have a `width` of `-1`', () => {
        var msg = ResizeMessage.UnknownSize;
        expect(msg.width).to.be(-1);
      });

      it('should have a `height` of `-1`', () => {
        var msg = ResizeMessage.UnknownSize;
        expect(msg.height).to.be(-1);
      });

    });

    describe('#constructor()', () => {

      it('should accept a width and height', () => {
        var msg = new ResizeMessage(100, 100);
        expect(msg instanceof ResizeMessage).to.be(true);
      });

    });

    describe('#width', () => {

      it('should be the width passed to the constructor', () => {
        var msg = new ResizeMessage(100, 200);
        expect(msg.width).to.be(100);
      });

      it('should be a read-only property', () => {
        var msg = new ResizeMessage(100, 200);
        expect(() => { msg.width = 200; }).to.throwError();
      });

    });

    describe('#height', () => {

      it('should be the height passed to the constructor', () => {
        var msg = new ResizeMessage(100, 200);
        expect(msg.height).to.be(200);
      });

      it('should be a read-only property', () => {
        var msg = new ResizeMessage(100, 200);
        expect(() => { msg.height = 200; }).to.throwError();
      });

    });

  });

});
