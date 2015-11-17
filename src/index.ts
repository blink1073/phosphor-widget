/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  IBoxSizing, ISizeLimits, boxSizing, sizeLimits
} from 'phosphor-domutil';

import {
  IMessageHandler, Message, clearMessageData, postMessage, sendMessage
} from 'phosphor-messaging';

import {
  NodeWrapper
} from 'phosphor-nodewrapper';

import {
  Property, clearPropertyData
} from 'phosphor-properties';

import {
  Queue
} from 'phosphor-queue';

import {
  ISignal, Signal, clearSignalData
} from 'phosphor-signaling';

import './index.css!';


/**
 * A singleton `'update-request'` message.
 *
 * #### Notes
 * This message can be dispatched to supporting widgets in order to
 * update their content. Not all widgets will respond to messages of
 * this type.
 *
 * This message is typically used to update the position and size of
 * a widget's children, or to update a widget's content to reflect the
 * current state of the widget.
 *
 * Messages of this type are compressed by default.
 *
 * **See also:** [[update]], [[onUpdateRequest]]
 */
export
const MSG_UPDATE_REQUEST = new Message('update-request');

/**
 * A singleton `'layout-request'` message.
 *
 * #### Notes
 * This message can be dispatched to supporting widgets in order to
 * update their layout. Not all widgets will respond to messages of
 * this type.
 *
 * This message is typically used to update the size contraints of
 * a widget and to update the position and size of its children.
 *
 * Messages of this type are compressed by default.
 *
 * **See also:** [[onLayoutRequest]]
 */
export
const MSG_LAYOUT_REQUEST = new Message('layout-request');

/**
 * A singleton `'close-request'` message.
 *
 * #### Notes
 * This message should be dispatched to a widget when it should close
 * and remove itself from the widget hierarchy.
 *
 * Messages of this type are compressed by default.
 *
 * **See also:** [[close]], [[onCloseRequest]]
 */
export
const MSG_CLOSE_REQUEST = new Message('close-request');

/**
 * A singleton `'after-show'` message.
 *
 * #### Notes
 * This message is sent to a widget when it becomes visible.
 *
 * This message is **not** sent when the widget is attached.
 *
 * **See also:** [[isVisible]], [[onAfterShow]]
 */
export
const MSG_AFTER_SHOW = new Message('after-show');

/**
 * A singleton `'before-hide'` message.
 *
 * #### Notes
 * This message is sent to a widget when it becomes not-visible.
 *
 * This message is **not** sent when the widget is detached.
 *
 * **See also:** [[isVisible]], [[onBeforeHide]]
 */
export
const MSG_BEFORE_HIDE = new Message('before-hide');

/**
 * A singleton `'after-attach'` message.
 *
 * #### Notes
 * This message is sent to a widget after it is attached to the DOM.
 *
 * **See also:** [[isAttached]], [[onAfterAttach]]
 */
export
const MSG_AFTER_ATTACH = new Message('after-attach');

/**
 * A singleton `'before-detach'` message.
 *
 * #### Notes
 * This message is sent to a widget before it is detached from the DOM.
 *
 * **See also:** [[isAttached]], [[onBeforeDetach]]
 */
export
const MSG_BEFORE_DETACH = new Message('before-detach');


/**
 * The base class of the Phosphor widget hierarchy.
 *
 * #### Notes
 * This class will typically be subclassed in order to create a useful
 * widget. However, it can be used by itself to host foreign content
 * such as a React or Bootstrap component. Simply instantiate an empty
 * widget and add the content directly to its [[node]]. The widget and
 * its content can then be embedded within a Phosphor widget hierarchy.
 */
export
class Widget extends NodeWrapper implements IDisposable, IMessageHandler {
  /**
   * The class name added to Widget instances.
   */
  static p_Widget = 'p-Widget';

  /**
   * The modifier class name added to hidden widgets.
   */
  static p_mod_hidden = 'p-mod-hidden';

  /**
   * A signal emitted when the widget is disposed.
   *
   * **See also:** [[disposed]], [[isDisposed]]
   */
  static disposedSignal = new Signal<Widget, void>();

  /**
   * A property descriptor which controls the hidden state of a widget.
   *
   * #### Notes
   * This property controls whether a widget is explicitly hidden.
   *
   * Hiding a widget will cause the widget and all of its descendants
   * to become not-visible.
   *
   * This property will toggle the presence of [[p_mod_hidden]] on a
   * widget. It will also dispatch `'after-show'` and `'before-hide'`
   * messages as appropriate.
   *
   * The default property value is `false`.
   *
   * **See also:** [[hidden]], [[isVisible]]
   */
  static hiddenProperty = new Property<Widget, boolean>({
    value: false,
    changed: onHiddenChanged,
  });

  /**
   * Construct a new widget.
   */
  constructor() {
    super();
    this.addClass(Widget.p_Widget);
  }

  /**
   * Dispose of the widget and its descendant widgets.
   *
   * #### Notes
   * It is generally unsafe to use the widget after it has been
   * disposed.
   *
   * If this method is called more than once, all calls made after
   * the first will be a no-op.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this._flags |= WidgetFlag.IsDisposed;
    this.disposed.emit(void 0);

    if (this._parent) {
      this._parent.removeChild(this);
    } else if (this.isAttached) {
      detachWidget(this);
    }

    while (this._children.length > 0) {
      var child = this._children.pop();
      child._parent = null;
      child.dispose();
    }

    clearSignalData(this);
    clearMessageData(this);
    clearPropertyData(this);
  }

  /**
   * A signal emitted when the widget is disposed.
   *
   * #### Notes
   * This is a pure delegate to the [[disposedSignal]].
   */
  get disposed(): ISignal<Widget, void> {
    return Widget.disposedSignal.bind(this);
  }

  /**
   * Test whether the widget's node is attached to the DOM.
   *
   * #### Notes
   * This is a read-only property which is always safe to access.
   *
   * **See also:** [[attachWidget]], [[detachWidget]]
   */
  get isAttached(): boolean {
    return (this._flags & WidgetFlag.IsAttached) !== 0;
  }

  /**
   * Test whether the widget has been disposed.
   *
   * #### Notes
   * This is a read-only property which is always safe to access.
   *
   * **See also:** [[disposed]]
   */
  get isDisposed(): boolean {
    return (this._flags & WidgetFlag.IsDisposed) !== 0;
  }

  /**
   * Test whether the widget is visible.
   *
   * #### Notes
   * A widget is visible when it is attached to the DOM, is not
   * explicitly hidden, and has no explicitly hidden ancestors.
   *
   * This is a read-only property which is always safe to access.
   *
   * **See also:** [[hidden]]
   */
  get isVisible(): boolean {
    return (this._flags & WidgetFlag.IsVisible) !== 0;
  }

  /**
   * Get whether the widget is explicitly hidden.
   *
   * #### Notes
   * This is a pure delegate to the [[hiddenProperty]].
   *
   * **See also:** [[isVisible]]
   */
  get hidden(): boolean {
    return Widget.hiddenProperty.get(this);
  }

  /**
   * Set whether the widget is explicitly hidden.
   *
   * #### Notes
   * This is a pure delegate to the [[hiddenProperty]].
   *
   * **See also:** [[isVisible]]
   */
  set hidden(value: boolean) {
    Widget.hiddenProperty.set(this, value);
  }

  /**
   * Get the box sizing for the widget's DOM node.
   *
   * #### Notes
   * This value is computed once and then cached in order to avoid
   * excessive style recomputations. The cache can be cleared via
   * [[clearBoxSizing]].
   *
   * Layout widgets rely on this property when computing their layout.
   * If a layout widget's box sizing changes at runtime, the box sizing
   * cache should be cleared and the layout widget should be posted a
   *`'layout-request'` message.
   *
   * This is a read-only property.
   *
   * **See also:** [[clearBoxSizing]]
   */
  get boxSizing(): IBoxSizing {
    if (this._box) return this._box;
    return this._box = Object.freeze(boxSizing(this.node));
  }

  /**
   * Get the size limits for the widget's DOM node.
   *
   * #### Notes
   * This value is computed once and then cached in order to avoid
   * excessive style recomputations. The cache can be cleared by
   * calling [[clearSizeLimits]].
   *
   * Layout widgets rely on this property of their child widgets when
   * computing the layout. If a child widget's size limits change at
   * runtime, the size limits should be cleared and the layout widget
   * should be posted a `'layout-request'` message.
   *
   * This is a read-only property.
   *
   * **See also:** [[setSizeLimits]], [[clearSizeLimits]]
   */
  get sizeLimits(): ISizeLimits {
    if (this._limits) return this._limits;
    return this._limits = Object.freeze(sizeLimits(this.node));
  }

  /**
   * Get the current offset geometry rect for the widget.
   *
   * #### Notes
   * If the widget geometry has been set using [[setOffsetGeometry]],
   * those values will be used to populate the rect, and no data will
   * be read from the DOM. Otherwise, the offset geometry of the node
   * **will** be read from the DOM, which may cause a reflow.
   *
   * This is a read-only property.
   *
   * **See also:** [[setOffsetGeometry]], [[clearOffsetGeometry]]
   */
  get offsetRect(): IOffsetRect {
    if (this._rect) return cloneOffsetRect(this._rect);
    return getOffsetRect(this.node);
  }

  /**
   * Get the parent of the widget.
   *
   * #### Notes
   * This will be `null` if the widget does not have a parent.
   */
  get parent(): Widget {
    return this._parent;
  }

  /**
   * Set the parent of the widget.
   *
   * @throws Will throw an error if the widget is the parent.
   *
   * #### Notes
   * If the specified parent is the current parent, this is a no-op.
   *
   * If the specified parent is `null`, this is equivalent to the
   * expression `widget.parent.removeChild(widget)`, otherwise it
   * is equivalent to the expression `parent.addChild(widget)`.
   *
   * **See also:** [[addChild]], [[insertChild]], [[removeChild]]
   */
  set parent(parent: Widget) {
    if (parent && parent !== this._parent) {
      parent.addChild(this);
    } else if (!parent && this._parent) {
      this._parent.removeChild(this);
    }
  }

  /**
   * Get a shallow copy of the array of child widgets.
   *
   * #### Notes
   * When only iterating over the children, it can be faster to use
   * the child query methods, which do not perform a copy.
   *
   * **See also:** [[childCount]], [[childAt]]
   */
  get children(): Widget[] {
    return this._children.slice();
  }

  /**
   * Set the children of the widget.
   *
   * #### Notes
   * This will clear the current child widgets and add the specified
   * child widgets. Depending on the desired outcome, it can be more
   * efficient to use one of the child manipulation methods.
   *
   * **See also:** [[addChild]], [[insertChild]], [[removeChild]]
   */
  set children(children: Widget[]) {
    this.clearChildren();
    children.forEach(child => this.addChild(child));
  }

  /**
   * Get the number of children of the widget.
   *
   * #### Notes
   * This is a read-only property.
   *
   * **See also:** [[children]], [[childAt]]
   */
  get childCount(): number {
    return this._children.length;
  }

  /**
   * Get the child widget at a specific index.
   *
   * @param index - The index of the child of interest.
   *
   * @returns The child widget at the specified index, or `undefined`
   *  if the index is out of range.
   *
   * **See also:** [[childCount]], [[childIndex]]
   */
  childAt(index: number): Widget {
    return this._children[index | 0];
  }

  /**
   * Get the index of a specific child widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index of the specified child widget, or `-1` if
   *   the widget is not a child of this widget.
   *
   * **See also:** [[childCount]], [[childAt]]
   */
  childIndex(child: Widget): number {
    return this._children.indexOf(child);
  }

  /**
   * Add a child widget to the end of the widget's children.
   *
   * @param child - The child widget to add to this widget.
   *
   * @returns The new index of the child.
   *
   * @throws Will throw an error if a widget is added to itself.
   *
   * #### Notes
   * The child will be automatically removed from its current parent
   * before being added to this widget.
   *
   * **See also:** [[insertChild]], [[moveChild]]
   */
  addChild(child: Widget): number {
    return this.insertChild(this._children.length, child);
  }

  /**
   * Insert a child widget at a specific index.
   *
   * @param index - The target index for the widget. This will be
   *   clamped to the bounds of the children.
   *
   * @param child - The child widget to insert into the widget.
   *
   * @returns The new index of the child.
   *
   * @throws Will throw an error if a widget is inserted into itself.
   *
   * #### Notes
   * The child will be automatically removed from its current parent
   * before being added to this widget.
   *
   * **See also:** [[addChild]], [[moveChild]]
   */
  insertChild(index: number, child: Widget): number {
    if (child === this) {
      throw new Error('invalid child widget');
    }
    if (child._parent) {
      child._parent.removeChild(child);
    } else if (child.isAttached) {
      detachWidget(child);
    }
    child._parent = this;
    var i = arrays.insert(this._children, index, child);
    sendMessage(this, new ChildMessage('child-added', child, -1, i));
    return i;
  }

  /**
   * Move a child widget from one index to another.
   *
   * @param fromIndex - The index of the child of interest.
   *
   * @param toIndex - The target index for the child.
   *
   * @returns 'true' if the child was moved, or `false` if either
   *   of the given indices are out of range.
   *
   * #### Notes
   * This method can be more efficient than re-inserting an existing
   * child, as some widgets may be able to optimize child moves and
   * avoid making unnecessary changes to the DOM.
   *
   * **See also:** [[addChild]], [[insertChild]]
   */
  moveChild(fromIndex: number, toIndex: number): boolean {
    var i = fromIndex | 0;
    var j = toIndex | 0;
    if (!arrays.move(this._children, i, j)) {
      return false;
    }
    if (i !== j) {
      var child = this._children[j];
      sendMessage(this, new ChildMessage('child-moved', child, i, j));
    }
    return true;
  }

  /**
   * Remove the child widget at a specific index.
   *
   * @param index - The index of the child of interest.
   *
   * @returns The removed child widget, or `undefined` if the index
   *   is out of range.
   *
   * **See also:** [[removeChild]], [[clearChildren]]
   */
  removeChildAt(index: number): Widget {
    var i = index | 0;
    var child = arrays.removeAt(this._children, i);
    if (child) {
      child._parent = null;
      sendMessage(this, new ChildMessage('child-removed', child, i, -1));
    }
    return child;
  }

  /**
   * Remove a specific child widget from this widget.
   *
   * @param child - The child widget of interest.
   *
   * @returns The index which the child occupied, or `-1` if the
   *   child is not a child of this widget.
   *
   * **See also:** [[removeChildAt]], [[clearChildren]]
   */
  removeChild(child: Widget): number {
    var i = this.childIndex(child);
    if (i !== -1) this.removeChildAt(i);
    return i;
  }

  /**
   * Remove all child widgets from the widget.
   *
   * #### Notes
   * This will continue to remove children until the `childCount`
   * reaches zero. It is therefore possible to enter an infinite
   * loop if a message handler causes a child widget to be added
   * in response to one being removed.
   *
   * **See also:** [[removeChild]], [[removeChildAt]]
   */
  clearChildren(): void {
    while (this.childCount > 0) {
      this.removeChildAt(this.childCount - 1);
    }
  }

  /**
   * Dispatch an `'update-request'` message to the widget.
   *
   * @param immediate - Whether to dispatch the message immediately
   *   (`true`) or in the future (`false`). The default is `false`.
   *
   * **See also:** [[MSG_UPDATE_REQUEST]], [[onUpdateRequest]]
   */
  update(immediate = false): void {
    if (immediate) {
      sendMessage(this, MSG_UPDATE_REQUEST);
    } else {
      postMessage(this, MSG_UPDATE_REQUEST);
    }
  }

  /**
   * Dispatch a `'close-request'` message to the widget.
   *
   * @param immediate - Whether to dispatch the message immediately
   *   (`true`) or in the future (`false`). The default is `false`.
   *
   * **See also:** [[MSG_CLOSE_REQUEST]], [[onCloseRequest]]
   */
  close(immediate = false): void {
    if (immediate) {
      sendMessage(this, MSG_CLOSE_REQUEST);
    } else {
      postMessage(this, MSG_CLOSE_REQUEST);
    }
  }

  /**
   * Clear the cached box sizing for the widget.
   *
   * #### Notes
   * This method does **not** read from the DOM.
   *
   * This method does **not** write to the DOM.
   *
   * **See also:** [[boxSizing]]
   */
  clearBoxSizing(): void {
    this._box = null;
  }

  /**
   * Set the size limits for the widget's DOM node.
   *
   * @param minWidth - The min width for the widget, in pixels.
   *
   * @param minHeight - The min height for the widget, in pixels.
   *
   * @param maxWidth - The max width for the widget, in pixels.
   *
   * @param maxHeight - The max height for the widget, in pixels.
   *
   * #### Notes
   * This method does **not** read from the DOM.
   *
   * **See also:** [[sizeLimits]], [[clearSizeLimits]]
   */
  setSizeLimits(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number): void {
    var minW = Math.max(0, minWidth);
    var minH = Math.max(0, minHeight);
    var maxW = Math.max(0, maxWidth);
    var maxH = Math.max(0, maxHeight);
    this._limits = Object.freeze({
      minWidth: minW,
      minHeight: minH,
      maxWidth: maxW,
      maxHeight: maxH,
    });
    var style = this.node.style;
    style.minWidth = minW + 'px';
    style.minHeight = minH + 'px';
    style.maxWidth = (maxW === Infinity) ? '' : maxW + 'px';
    style.maxHeight = (maxH === Infinity) ? '' : maxH + 'px';
  }

  /**
   * Clear the cached size limits for the widget.
   *
   * #### Notes
   * This method does **not** read from the DOM.
   *
   * **See also:** [[sizeLimits]], [[setSizeLimits]]
   */
  clearSizeLimits(): void {
    this._limits = null;
    var style = this.node.style;
    style.minWidth = '';
    style.maxWidth = '';
    style.minHeight = '';
    style.maxHeight = '';
  }

  /**
   * Set the offset geometry for the widget.
   *
   * @param left - The offset left edge of the widget, in pixels.
   *
   * @param top - The offset top edge of the widget, in pixels.
   *
   * @param width - The offset width of the widget, in pixels.
   *
   * @param height - The offset height of the widget, in pixels.
   *
   * #### Notes
   * This method is only useful when using absolute positioning to set
   * the layout geometry of the widget. It will update the inline style
   * of the widget with the specified values. If the width or height is
   * different from the previous value, a [[ResizeMessage]] will be sent
   * to the widget.
   *
   * This method does **not** take into account the size limits of the
   * widget. It is assumed that the specified width and height do not
   * violate the size constraints of the widget.
   *
   * This method does **not** read any data from the DOM.
   *
   * Code which uses this method to layout a widget is responsible for
   * calling [[clearOffsetGeometry]] when it is finished managing the
   * widget.
   *
   * **See also:** [[offsetRect]], [[clearOffsetGeometry]]
   */
  setOffsetGeometry(left: number, top: number, width: number, height: number): void {
    var rect = this._rect || (this._rect = makeOffsetRect());
    var style = this.node.style;
    var resized = false;
    if (top !== rect.top) {
      rect.top = top;
      style.top = top + 'px';
    }
    if (left !== rect.left) {
      rect.left = left;
      style.left = left + 'px';
    }
    if (width !== rect.width) {
      resized = true;
      rect.width = width;
      style.width = width + 'px';
    }
    if (height !== rect.height) {
      resized = true;
      rect.height = height;
      style.height = height + 'px';
    }
    if (resized) sendMessage(this, new ResizeMessage(width, height));
  }

  /**
   * Clear the offset geometry for the widget.
   *
   * #### Notes
   * This method is only useful when using absolute positioning to set
   * the layout geometry of the widget. It will reset the inline style
   * of the widget and clear the stored offset geometry values.
   *
   * This method will **not** dispatch a [[ResizeMessage]].
   *
   * This method does **not** read any data from the DOM.
   *
   * This method should be called by the widget's layout manager when
   * it no longer manages the widget. It allows the widget to be added
   * to another layout panel without conflict.
   *
   * **See also:** [[offsetRect]], [[setOffsetGeometry]]
   */
  clearOffsetGeometry(): void {
    if (!this._rect) {
      return;
    }
    this._rect = null;
    var style = this.node.style;
    style.top = '';
    style.left = '';
    style.width = '';
    style.height = '';
  }

  /**
   * Process a message sent to the widget.
   *
   * @param msg - The message sent to the widget.
   *
   * #### Notes
   * Subclasses may reimplement this method as needed.
   */
  processMessage(msg: Message): void {
    switch (msg.type) {
    case 'resize':
      this.onResize(<ResizeMessage>msg);
      break;
    case 'update-request':
      this.onUpdateRequest(msg);
      break;
    case 'layout-request':
      this.onLayoutRequest(msg);
      break;
    case 'child-added':
      this.onChildAdded(<ChildMessage>msg);
      break;
    case 'child-removed':
      this.onChildRemoved(<ChildMessage>msg);
      break;
    case 'child-moved':
      this.onChildMoved(<ChildMessage>msg);
      break;
    case 'after-show':
      this._flags |= WidgetFlag.IsVisible;
      this.onAfterShow(msg);
      sendToShown(this._children, msg);
      break;
    case 'before-hide':
      this.onBeforeHide(msg);
      sendToShown(this._children, msg);
      this._flags &= ~WidgetFlag.IsVisible;
      break;
    case 'after-attach':
      var visible = !this.hidden && (!this._parent || this._parent.isVisible);
      if (visible) this._flags |= WidgetFlag.IsVisible;
      this._flags |= WidgetFlag.IsAttached;
      this.onAfterAttach(msg);
      sendToAll(this._children, msg);
      break;
    case 'before-detach':
      this.onBeforeDetach(msg);
      sendToAll(this._children, msg);
      this._flags &= ~WidgetFlag.IsVisible;
      this._flags &= ~WidgetFlag.IsAttached;
      break;
    case 'child-shown':
      this.onChildShown(<ChildMessage>msg);
      break;
    case 'child-hidden':
      this.onChildHidden(<ChildMessage>msg);
      break;
    case 'close-request':
      this.onCloseRequest(msg);
      break;
    }
  }

  /**
   * Compress a message posted to the widget.
   *
   * @param msg - The message posted to the widget.
   *
   * @param pending - The queue of pending messages for the widget.
   *
   * @returns `true` if the message was compressed and should be
   *   dropped, or `false` if the message should be enqueued for
   *   delivery as normal.
   *
   * #### Notes
   * The default implementation compresses the following messages:
   * `'update-request'`, `'layout-request'`, and `'close-request'`.
   *
   * Subclasses may reimplement this method as needed.
   */
  compressMessage(msg: Message, pending: Queue<Message>): boolean {
    switch (msg.type) {
      case 'update-request':
      case 'layout-request':
      case 'close-request':
        return pending.some(other => other.type === msg.type);
    }
    return false;
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   *
   * #### Notes
   * The default implementation adds the child node to the widget
   * node at the proper location and dispatches an `'after-attach'`
   * message if appropriate.
   *
   * Subclasses may reimplement this method to control how the child
   * node is added, but they must dispatch an `'after-attach'` message
   * if appropriate.
   */
  protected onChildAdded(msg: ChildMessage): void {
    var next = this.childAt(msg.currentIndex + 1);
    this.node.insertBefore(msg.child.node, next && next.node);
    if (this.isAttached) sendMessage(msg.child, MSG_AFTER_ATTACH);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   *
   * #### Notes
   * The default implementation removes the child node from the widget
   * node and dispatches a `'before-detach'` message if appropriate.
   *
   * Subclasses may reimplement this method to control how the child
   * node is removed, but they must  dispatch a `'before-detach'`
   * message if appropriate.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    if (this.isAttached) sendMessage(msg.child, MSG_BEFORE_DETACH);
    this.node.removeChild(msg.child.node);
  }

  /**
   * A message handler invoked on a `'child-moved'` message.
   *
   * #### Notes
   * The default implementation moves the child node to the proper
   * location in the widget node and dispatches a `'before-detach'`
   * and `'after-attach'` message if appropriate.
   *
   * Subclasses may reimplement this method to control how the child
   * node is moved, but they must dispatch a `'before-detach'` and
   * `'after-attach'` message if appropriate.
   */
  protected onChildMoved(msg: ChildMessage): void {
    if (this.isAttached) sendMessage(msg.child, MSG_BEFORE_DETACH);
    var next = this.childAt(msg.currentIndex + 1);
    this.node.insertBefore(msg.child.node, next && next.node);
    if (this.isAttached) sendMessage(msg.child, MSG_AFTER_ATTACH);
  }

  /**
   * A message handler invoked on a `'resize'` message.
   *
   * #### Notes
   * The default implementation of this handler sends an [[UnknownSize]]
   * resize message to each child. This ensures that the resize messages
   * propagate through all widgets in the hierarchy.
   *
   * Subclasses may reimplement this method as needed, but they must
   * dispatch `'resize'` messages to their children as appropriate.
   */
  protected onResize(msg: ResizeMessage): void {
    sendToAll(this._children, ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   *
   * #### Notes
   * The default implementation of this handler sends an [[UnknownSize]]
   * resize message to each child. This ensures that the resize messages
   * propagate through all widgets in the hierarchy.
   *
   * Subclass may reimplement this method as needed, but they should
   * dispatch `'resize'` messages to their children as appropriate.
   *
   * **See also:** [[update]], [[MSG_UPDATE_REQUEST]]
   */
  protected onUpdateRequest(msg: Message): void {
    sendToAll(this._children, ResizeMessage.UnknownSize);
  }

  /**
   * A message handler invoked on a `'close-request'` message.
   *
   * #### Notes
   * The default implementation of this handler will unparent or detach
   * the widget as appropriate. Subclasses may reimplement this handler
   * for custom close behavior.
   *
   * **See also:** [[close]], [[MSG_CLOSE_REQUEST]]
   */
  protected onCloseRequest(msg: Message): void {
    if (this._parent) {
      this._parent.removeChild(this);
    } else if (this.isAttached) {
      detachWidget(this);
    }
  }

  /**
   * A message handler invoked on a `'layout-request'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_LAYOUT_REQUEST]]
   */
  protected onLayoutRequest(msg: Message): void { }

  /**
   * A message handler invoked on an `'after-show'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_AFTER_SHOW]]
   */
  protected onAfterShow(msg: Message): void { }

  /**
   * A message handler invoked on a `'before-hide'` message.
   *
   * The default implementation of this handler is a no-op.
   *
   * **See also:** [[MSG_BEFORE_HIDE]]
   */
  protected onBeforeHide(msg: Message): void { }

  /**
   * A message handler invoked on an `'after-attach'` message.
   *
   * **See also:** [[MSG_AFTER_ATTACH]]
   */
  protected onAfterAttach(msg: Message): void { }

  /**
   * A message handler invoked on a `'before-detach'` message.
   *
   * **See also:** [[MSG_BEFORE_DETACH]]
   */
  protected onBeforeDetach(msg: Message): void { }

  /**
   * A message handler invoked on a `'child-shown'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onChildShown(msg: ChildMessage): void { }

  /**
   * A message handler invoked on a `'child-hidden'` message.
   *
   * The default implementation of this handler is a no-op.
   */
  protected onChildHidden(msg: ChildMessage): void { }

  private _flags = 0;
  private _parent: Widget = null;
  private _children: Widget[] = [];
  private _box: IBoxSizing = null;
  private _rect: IOffsetRect = null;
  private _limits: ISizeLimits = null;
}


/**
 * Attach a widget to a host DOM node.
 *
 * @param widget - The widget to attach to the DOM.
 *
 * @param host - The node to use as the widget's host.
 *
 * @throws Will throw an error if the widget is not a root widget,
 *   if the widget is already attached to the DOM, or if the host
 *   is not attached to the DOM.
 *
 * #### Notes
 * This function ensures that an `'after-attach'` message is dispatched
 * to the hierarchy. It should be used in lieu of manual DOM attachment.
 */
export
function attachWidget(widget: Widget, host: HTMLElement): void {
  if (widget.parent) {
    throw new Error('only a root widget can be attached to the DOM');
  }
  if (widget.isAttached || document.body.contains(widget.node)) {
    throw new Error('widget is already attached to the DOM');
  }
  if (!document.body.contains(host)) {
    throw new Error('host is not attached to the DOM');
  }
  host.appendChild(widget.node);
  sendMessage(widget, MSG_AFTER_ATTACH);
}


/**
 * Detach a widget from its host DOM node.
 *
 * @param widget - The widget to detach from the DOM.
 *
 * @throws Will throw an error if the widget is not a root widget,
 *   or if the widget is not attached to the DOM.
 *
 * #### Notes
 * This function ensures that a `'before-detach'` message is dispatched
 * to the hierarchy. It should be used in lieu of manual DOM detachment.
 */
export
function detachWidget(widget: Widget): void {
  if (widget.parent) {
    throw new Error('only a root widget can be detached from the DOM');
  }
  if (!widget.isAttached || !document.body.contains(widget.node)) {
    throw new Error('widget is not attached to the DOM');
  }
  sendMessage(widget, MSG_BEFORE_DETACH);
  widget.node.parentNode.removeChild(widget.node);
}


/**
 * A message class for child-related messages.
 */
export
class ChildMessage extends Message {
  /**
   * Construct a new child message.
   *
   * @param type - The message type.
   *
   * @param child - The child widget for the message.
   *
   * @param previousIndex - The previous index of the child, if known.
   *   The default index is `-1` and indicates an unknown index.
   *
   * @param currentIndex - The current index of the child, if known.
   *   The default index is `-1` and indicates an unknown index.
   */
  constructor(type: string, child: Widget, previousIndex = -1, currentIndex = -1) {
    super(type);
    this._child = child;
    this._currentIndex = currentIndex;
    this._previousIndex = previousIndex;
  }

  /**
   * The child widget for the message.
   *
   * #### Notes
   * This is a read-only property.
   */
  get child(): Widget {
    return this._child;
  }

  /**
   * The current index of the child.
   *
   * #### Notes
   * This will be `-1` if the current index is unknown.
   *
   * This is a read-only property.
   */
  get currentIndex(): number {
    return this._currentIndex;
  }

  /**
   * The previous index of the child.
   *
   * #### Notes
   * This will be `-1` if the previous index is unknown.
   *
   * This is a read-only property.
   */
  get previousIndex(): number {
    return this._previousIndex;
  }

  private _child: Widget;
  private _currentIndex: number;
  private _previousIndex: number;
}


/**
 * A message class for 'resize' messages.
 */
export
class ResizeMessage extends Message {
  /**
   * A singleton 'resize' message with an unknown size.
   */
  static UnknownSize = new ResizeMessage(-1, -1);

  /**
   * Construct a new resize message.
   *
   * @param width - The **offset width** of the widget, or `-1` if
   *   the width is not known.
   *
   * @param height - The **offset height** of the widget, or `-1` if
   *   the height is not known.
   */
  constructor(width: number, height: number) {
    super('resize');
    this._width = width;
    this._height = height;
  }

  /**
   * The offset width of the widget.
   *
   * #### Notes
   * This will be `-1` if the width is unknown.
   *
   * This is a read-only property.
   */
  get width(): number {
    return this._width;
  }

  /**
   * The offset height of the widget.
   *
   * #### Notes
   * This will be `-1` if the height is unknown.
   *
   * This is a read-only property.
   */
  get height(): number {
    return this._height;
  }

  private _width: number;
  private _height: number;
}


/**
 * An object which stores offset geometry information.
 */
export
interface IOffsetRect {
  /**
   * The offset top edge, in pixels.
   */
  top: number;

  /**
   * The offset left edge, in pixels.
   */
  left: number;

  /**
   * The offset width, in pixels.
   */
  width: number;

  /**
   * The offset height, in pixels.
   */
  height: number;
}


/**
 * An enum of widget bit flags.
 */
enum WidgetFlag {
  /**
   * The widget is attached to the DOM.
   */
  IsAttached = 0x1,

  /**
   * The widget is visible.
   */
  IsVisible = 0x2,

  /**
   * The widget has been disposed.
   */
  IsDisposed = 0x4,
}


/**
 * Create a new offset rect full of NaN's.
 */
function makeOffsetRect(): IOffsetRect {
  return { top: NaN, left: NaN, width: NaN, height: NaN };
}


/**
 * Clone an offset rect object.
 */
function cloneOffsetRect(rect: IOffsetRect): IOffsetRect {
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height
  };
}


/**
 * Get the offset rect for a DOM node.
 */
function getOffsetRect(node: HTMLElement): IOffsetRect {
  return {
    top: node.offsetTop,
    left: node.offsetLeft,
    width: node.offsetWidth,
    height: node.offsetHeight,
  };
}


/**
 * The change handler for the [[hiddenProperty]].
 */
function onHiddenChanged(owner: Widget, old: boolean, hidden: boolean): void {
  if (hidden) {
    if (owner.isAttached && (!owner.parent || owner.parent.isVisible)) {
      sendMessage(owner, MSG_BEFORE_HIDE);
    }
    owner.addClass(Widget.p_mod_hidden);
    if (owner.parent) {
      sendMessage(owner.parent, new ChildMessage('child-hidden', owner));
    }
  } else {
    owner.removeClass(Widget.p_mod_hidden);
    if (owner.isAttached && (!owner.parent || owner.parent.isVisible)) {
      sendMessage(owner, MSG_AFTER_SHOW);
    }
    if (owner.parent) {
      sendMessage(owner.parent, new ChildMessage('child-shown', owner));
    }
  }
}


/**
 * Send a message to all widgets in an array.
 */
function sendToAll(array: Widget[], msg: Message): void {
  for (var i = 0; i < array.length; ++i) {
    sendMessage(array[i], msg);
  }
}


/**
 * Send a message to all non-hidden widgets in an array.
 */
function sendToShown(array: Widget[], msg: Message): void {
  for (var i = 0; i < array.length; ++i) {
    if (!array[i].hidden) sendMessage(array[i], msg);
  }
}
