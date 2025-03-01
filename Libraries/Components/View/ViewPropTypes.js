/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

'use strict';

import type {
  BlurEvent,
  FocusEvent,
  MouseEvent,
  PressEvent,
  Layout,
  LayoutEvent,
  ScrollEvent, // TODO(macOS GH#774)
  KeyEvent,
} from '../../Types/CoreEventTypes';
import type {EdgeInsetsProp} from '../../StyleSheet/EdgeInsetsPropType';
import type {Node} from 'react';
import type {ViewStyleProp} from '../../StyleSheet/StyleSheet';
import type {CursorValue} from '../../StyleSheet/StyleSheetTypes';
import type {
  AccessibilityRole,
  AccessibilityState,
  AccessibilityValue,
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  AccessibilityNodeInfoProp, // TODO(android ISS)
} from './ViewAccessibility';

// [TODO(macOS GH#774)
import type {DraggedTypesType} from '../View/DraggedType';
//$FlowFixMe
import {array} from 'yargs';
// ]TODO(macOS GH#774)

export type ViewLayout = Layout;
export type ViewLayoutEvent = LayoutEvent;

type BubblingEventProps = $ReadOnly<{|
  onBlur?: ?(event: BlurEvent) => mixed,
  onFocus?: ?(event: FocusEvent) => mixed,
  onKeyDown?: ?(event: KeyEvent) => mixed,
  onKeyUp?: ?(event: KeyEvent) => mixed,
|}>;

type DirectEventProps = $ReadOnly<{|
  /**
   * When `accessible` is true, the system will try to invoke this function
   * when the user performs an accessibility custom action.
   *
   */
  onAccessibilityAction?: ?(event: AccessibilityActionEvent) => mixed,

  /**
   * When `accessible` is true, the system will try to invoke this function
   * when the user performs accessibility tap gesture.
   *
   * See https://reactnative.dev/docs/view.html#onaccessibilitytap
   */
  onAccessibilityTap?: ?() => mixed,

  /**
   * When `accessible` is true, the system will try to invoke this function
   * when the user performs accessibility double click gesture.
   */
  onDoubleClick?: ?(event: SyntheticEvent<{}>) => mixed, // TODO(macOS GH#774)

  /**
   * This event is fired when the system's preferred scroller style changes.
   * The `preferredScrollerStyle` key will be `legacy` or `overlay`.
   */
  onPreferredScrollerStyleDidChange?: ?(event: ScrollEvent) => mixed, // TODO(macOS GH#774)

  /**
   * When `acceptsKeyboardFocus` is true, the system will try to invoke this function
   * when the user performs accessibility key down gesture.
   */
  onScrollKeyDown?: ?(event: ScrollEvent) => mixed, // TODO(macOS GH#774)

  /**
   * Invoked on mount and layout changes with:
   *
   * `{nativeEvent: { layout: {x, y, width, height}}}`
   *
   * This event is fired immediately once the layout has been calculated, but
   * the new layout may not yet be reflected on the screen at the time the
   * event is received, especially if a layout animation is in progress.
   *
   * See https://reactnative.dev/docs/view.html#onlayout
   */
  onLayout?: ?(event: LayoutEvent) => mixed,

  /**
   * When `accessible` is `true`, the system will invoke this function when the
   * user performs the magic tap gesture.
   *
   * See https://reactnative.dev/docs/view.html#onmagictap
   */
  onMagicTap?: ?() => mixed,

  /**
   * When `accessible` is `true`, the system will invoke this function when the
   * user performs the escape gesture.
   *
   * See https://reactnative.dev/docs/view.html#onaccessibilityescape
   */
  onAccessibilityEscape?: ?() => mixed,
|}>;

type MouseEventProps = $ReadOnly<{|
  onMouseEnter?: (event: MouseEvent) => void,
  onMouseLeave?: (event: MouseEvent) => void,
|}>;

type TouchEventProps = $ReadOnly<{|
  onTouchCancel?: ?(e: PressEvent) => void,
  onTouchCancelCapture?: ?(e: PressEvent) => void,
  onTouchEnd?: ?(e: PressEvent) => void,
  onTouchEndCapture?: ?(e: PressEvent) => void,
  onTouchMove?: ?(e: PressEvent) => void,
  onTouchMoveCapture?: ?(e: PressEvent) => void,
  onTouchStart?: ?(e: PressEvent) => void,
  onTouchStartCapture?: ?(e: PressEvent) => void,
|}>;

/**
 * For most touch interactions, you'll simply want to wrap your component in
 * `TouchableHighlight` or `TouchableOpacity`. Check out `Touchable.js`,
 * `ScrollResponder.js` and `ResponderEventPlugin.js` for more discussion.
 */
type GestureResponderEventProps = $ReadOnly<{|
  /**
   * Does this view want to "claim" touch responsiveness? This is called for
   * every touch move on the `View` when it is not the responder.
   *
   * `View.props.onMoveShouldSetResponder: (event) => [true | false]`, where
   * `event` is a synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onmoveshouldsetresponder
   */
  onMoveShouldSetResponder?: ?(e: PressEvent) => boolean,

  /**
   * If a parent `View` wants to prevent a child `View` from becoming responder
   * on a move, it should have this handler which returns `true`.
   *
   * `View.props.onMoveShouldSetResponderCapture: (event) => [true | false]`,
   * where `event` is a synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onMoveShouldsetrespondercapture
   */
  onMoveShouldSetResponderCapture?: ?(e: PressEvent) => boolean,

  /**
   * The View is now responding for touch events. This is the time to highlight
   * and show the user what is happening.
   *
   * `View.props.onResponderGrant: (event) => {}`, where `event` is a synthetic
   * touch event as described above.
   *
   * PanResponder includes a note `// TODO: t7467124 investigate if this can be removed` that
   * should help fixing this return type.
   *
   * See https://reactnative.dev/docs/view.html#onrespondergrant
   */
  onResponderGrant?: ?(e: PressEvent) => void | boolean,

  /**
   * The user is moving their finger.
   *
   * `View.props.onResponderMove: (event) => {}`, where `event` is a synthetic
   * touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onrespondermove
   */
  onResponderMove?: ?(e: PressEvent) => void,

  /**
   * Another responder is already active and will not release it to that `View`
   * asking to be the responder.
   *
   * `View.props.onResponderReject: (event) => {}`, where `event` is a
   * synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onresponderreject
   */
  onResponderReject?: ?(e: PressEvent) => void,

  /**
   * Fired at the end of the touch.
   *
   * `View.props.onResponderRelease: (event) => {}`, where `event` is a
   * synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onresponderrelease
   */
  onResponderRelease?: ?(e: PressEvent) => void,

  onResponderStart?: ?(e: PressEvent) => void,
  onResponderEnd?: ?(e: PressEvent) => void,

  /**
   * The responder has been taken from the `View`. Might be taken by other
   * views after a call to `onResponderTerminationRequest`, or might be taken
   * by the OS without asking (e.g., happens with control center/ notification
   * center on iOS)
   *
   * `View.props.onResponderTerminate: (event) => {}`, where `event` is a
   * synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onresponderterminate
   */
  onResponderTerminate?: ?(e: PressEvent) => void,

  /**
   * Some other `View` wants to become responder and is asking this `View` to
   * release its responder. Returning `true` allows its release.
   *
   * `View.props.onResponderTerminationRequest: (event) => {}`, where `event`
   * is a synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onresponderterminationrequest
   */
  onResponderTerminationRequest?: ?(e: PressEvent) => boolean,

  /**
   * Does this view want to become responder on the start of a touch?
   *
   * `View.props.onStartShouldSetResponder: (event) => [true | false]`, where
   * `event` is a synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onstartshouldsetresponder
   */
  onStartShouldSetResponder?: ?(e: PressEvent) => boolean,

  /**
   * If a parent `View` wants to prevent a child `View` from becoming responder
   * on a touch start, it should have this handler which returns `true`.
   *
   * `View.props.onStartShouldSetResponderCapture: (event) => [true | false]`,
   * where `event` is a synthetic touch event as described above.
   *
   * See https://reactnative.dev/docs/view.html#onstartshouldsetrespondercapture
   */
  onStartShouldSetResponderCapture?: ?(e: PressEvent) => boolean,
|}>;

type AndroidDrawableThemeAttr = $ReadOnly<{|
  type: 'ThemeAttrAndroid',
  attribute: string,
|}>;

type AndroidDrawableRipple = $ReadOnly<{|
  type: 'RippleAndroid',
  color?: ?number,
  borderless?: ?boolean,
  rippleRadius?: ?number,
|}>;

type AndroidDrawable = AndroidDrawableThemeAttr | AndroidDrawableRipple;

type AndroidViewProps = $ReadOnly<{|
  nativeBackgroundAndroid?: ?AndroidDrawable,
  nativeForegroundAndroid?: ?AndroidDrawable,

  /**
   * Whether this `View` should render itself (and all of its children) into a
   * single hardware texture on the GPU.
   *
   * @platform android
   *
   * See https://reactnative.dev/docs/view.html#rendertohardwaretextureandroid
   */
  renderToHardwareTextureAndroid?: ?boolean,

  /**
   * Views that are only used to layout their children or otherwise don't draw
   * anything may be automatically removed from the native hierarchy as an
   * optimization. Set this property to `false` to disable this optimization and
   * ensure that this `View` exists in the native view hierarchy.
   *
   * @platform android
   *
   * See https://reactnative.dev/docs/view.html#collapsable
   */
  collapsable?: ?boolean,

  /**
   * Whether this `View` needs to rendered offscreen and composited with an
   * alpha in order to preserve 100% correct colors and blending behavior.
   *
   * @platform android
   *
   * See https://reactnative.dev/docs/view.html#needsoffscreenalphacompositing
   */
  needsOffscreenAlphaCompositing?: ?boolean,

  /**
   * When `true`, indicates that the view is clickable. By default,
   * all the touchable elements are clickable.
   *
   * @platform android
   */
  focusable?: ?boolean, // TODO(android ISS)

  /**
   * When `clickable` is true, the system will try to invoke this function
   * when the user performs a click.
   *
   * @platform android
   */

  onClick?: ?(event: PressEvent) => mixed, // TODO(android ISS)

  /**
   * Indicates to accessibility services whether the user should be notified
   * when this view changes. Works for Android API >= 19 only.
   *
   * @platform android
   *
   * See https://reactnative.dev/docs/view.html#accessibilityliveregion
   */
  accessibilityLiveRegion?: ?('none' | 'polite' | 'assertive'),

  /**
   * fired when the view focus changes (gain->lose or lose->gain)
   *
   * @platform android
   */
  onFocusChange?: ?(event: SyntheticEvent<{}>) => mixed, // TODO(android ISS)

  /**
   * Controls how view is important for accessibility which is if it
   * fires accessibility events and if it is reported to accessibility services
   * that query the screen. Works for Android only.
   *
   * @platform android
   *
   * See https://reactnative.dev/docs/view.html#importantforaccessibility
   */
  importantForAccessibility?: ?('auto' | 'yes' | 'no' | 'no-hide-descendants'),

  accessibilityNodeInfo?: AccessibilityNodeInfoProp, // TODO(android ISS)

  /**
   * Whether to force the Android TV focus engine to move focus to this view.
   *
   * @platform android
   */
  hasTVPreferredFocus?: ?boolean,

  /**
   * TV next focus down (see documentation for the View component).
   *
   * @platform android
   */
  nextFocusDown?: ?number,

  /**
   * TV next focus forward (see documentation for the View component).
   *
   * @platform android
   */
  nextFocusForward?: ?number,

  /**
   * TV next focus left (see documentation for the View component).
   *
   * @platform android
   */
  nextFocusLeft?: ?number,

  /**
   * TV next focus right (see documentation for the View component).
   *
   * @platform android
   */
  nextFocusRight?: ?number,

  /**
   * TV next focus up (see documentation for the View component).
   *
   * @platform android
   */
  nextFocusUp?: ?number,

  /**
   * Whether this `View` should be focusable with a non-touch input device, eg. receive focus with a hardware keyboard.
   *
   * @platform android
   */
  focusable?: boolean,

  /**
   * The action to perform when this `View` is clicked on by a non-touch click, eg. enter key on a hardware keyboard.
   *
   * @platform android
   */
  onClick?: ?(event: PressEvent) => mixed,
|}>;

type IOSViewProps = $ReadOnly<{|
  /**
   * Prevents view from being inverted if set to true and color inversion is turned on.
   *
   * @platform ios
   */
  accessibilityIgnoresInvertColors?: ?boolean,

  /**
   * A value indicating whether VoiceOver should ignore the elements
   * within views that are siblings of the receiver.
   * Default is `false`.
   *
   * @platform ios
   *
   * See https://reactnative.dev/docs/view.html#accessibilityviewismodal
   */
  accessibilityViewIsModal?: ?boolean,

  /**
   * A value indicating whether the accessibility elements contained within
   * this accessibility element are hidden.
   *
   * @platform ios
   *
   * See https://reactnative.dev/docs/view.html#accessibilityElementsHidden
   */
  accessibilityElementsHidden?: ?boolean,

  onDoubleClick?: ?(event: SyntheticEvent<{}>) => mixed, // TODO(macOS GH#774)

  /**
   * When `accessible` is true, the system will try to invoke this function
   * when the user performs accessibility tap gesture.
   *
   * See http://facebook.github.io/react-native/docs/view.html#onaccessibilitytap
   */
  onAccessibilityTap?: ?() => void,

  /**
   * When `accessible` is `true`, the system will invoke this function when the
   * user performs the magic tap gesture.
   *
   * See https://reactnative.dev/docs/view.html#shouldrasterizeios
   */
  shouldRasterizeIOS?: ?boolean,
|}>;

export type ViewProps = $ReadOnly<{|
  ...BubblingEventProps,
  ...DirectEventProps,
  ...GestureResponderEventProps,
  ...MouseEventProps,
  ...TouchEventProps,
  ...AndroidViewProps,
  ...IOSViewProps,

  children?: Node,
  style?: ?ViewStyleProp,

  /**
   * When `true`, indicates that the view is an accessibility element.
   * By default, all the touchable elements are accessible.
   *
   * See https://reactnative.dev/docs/view.html#accessible
   */
  accessible?: ?boolean,

  /**
   * Overrides the text that's read by the screen reader when the user interacts
   * with the element. By default, the label is constructed by traversing all
   * the children and accumulating all the `Text` nodes separated by space.
   *
   * See https://reactnative.dev/docs/view.html#accessibilitylabel
   */
  accessibilityLabel?: ?Stringish,

  /**
   * An accessibility hint helps users understand what will happen when they perform
   * an action on the accessibility element when that result is not obvious from the
   * accessibility label.
   *
   *
   * See https://reactnative.dev/docs/view.html#accessibilityHint
   */
  accessibilityHint?: ?Stringish,

  /**
   * Indicates to accessibility services to treat UI component like a specific role.
   */
  accessibilityRole?: ?AccessibilityRole,

  /**
   * Indicates to accessibility services that UI Component is in a specific State.
   */
  accessibilityState?: ?AccessibilityState,
  accessibilityValue?: ?AccessibilityValue,

  /**
   * Provides an array of custom actions available for accessibility.
   *
   */
  accessibilityActions?: ?$ReadOnlyArray<AccessibilityActionInfo>,

  /**
   * Used to locate this view in end-to-end tests.
   *
   * > This disables the 'layout-only view removal' optimization for this view!
   *
   * See https://reactnative.dev/docs/view.html#testid
   */
  testID?: ?string,

  /**
   * Used to locate this view from native classes.
   *
   * > This disables the 'layout-only view removal' optimization for this view!
   *
   * See https://reactnative.dev/docs/view.html#nativeid
   */
  nativeID?: ?string,

  /**
   * This defines how far a touch event can start away from the view.
   * Typical interface guidelines recommend touch targets that are at least
   * 30 - 40 points/density-independent pixels.
   *
   * > The touch area never extends past the parent view bounds and the Z-index
   * > of sibling views always takes precedence if a touch hits two overlapping
   * > views.
   *
   * See https://reactnative.dev/docs/view.html#hitslop
   */
  hitSlop?: ?EdgeInsetsProp,

  /**
   * Controls whether the `View` can be the target of touch events.
   *
   * See https://reactnative.dev/docs/view.html#pointerevents
   */
  pointerEvents?: ?('auto' | 'box-none' | 'box-only' | 'none'),

  /**
   * This is a special performance property exposed by `RCTView` and is useful
   * for scrolling content when there are many subviews, most of which are
   * offscreen. For this property to be effective, it must be applied to a
   * view that contains many subviews that extend outside its bound. The
   * subviews must also have `overflow: hidden`, as should the containing view
   * (or one of its superviews).
   *
   * See https://reactnative.dev/docs/view.html#removeclippedsubviews
   */
  removeClippedSubviews?: ?boolean,

  /**
   * Fired when a dragged element enters a valid drop target
   *
   * @platform macos
   */
  onDragEnter?: (event: MouseEvent) => void, // TODO(macOS GH#774)

  /**
   * Fired when a dragged element leaves a valid drop target
   *
   * @platform macos
   */
  onDragLeave?: (event: MouseEvent) => void, // TODO(macOS GH#774)

  /**
   * Fired when an element is dropped on a valid drop target
   *
   * @platform macos
   */
  onDrop?: (event: MouseEvent) => void, // TODO(macOS GH#774)

  /**
   * Specifies the Tooltip for the view
   * @platform macos
   */
  tooltip?: ?string, // TODO(macOS GH#774)

  /**
   * Specifies whether the view should receive the mouse down event when the
   * containing window is in the background.
   *
   * @platform macos
   */
  acceptsFirstMouse?: ?boolean, // TODO(macOS GH#774)

  /**
   * Specifies whether the view participates in the key view loop as user tabs
   * through different controls.
   */
  acceptsKeyboardFocus?: ?boolean, // TODO(macOS GH#774)

  /**
   * The react tag of the view that follows the current view in the key view loop.
   */
  nextKeyViewTag?: ?number, // TODO(macOS GH#768)

  /**
   * Specifies whether focus ring should be drawn when the view has the first responder status.
   */
  enableFocusRing?: ?boolean, // TODO(macOS GH#774)

  /*
   * Array of keys to receive key down events for
   * For arrow keys, add "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
   */
  validKeysDown?: ?array<string>,

  /*
   * Array of keys to receive key up events for
   * For arrow keys, add "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
   */
  validKeysUp?: ?array<string>,

  /**
   * Enables Dran'n'Drop Support for certain types of dragged types
   *
   * Possible values for `draggedTypes` are:
   *
   * - `'fileUrl'`
   *
   * @platform macos
   */
  draggedTypes?: ?DraggedTypesType, // TODO(macOS GH#774)
    
 /**
   * Sets the type of mouse cursor, to show when the mouse pointer is over the view.
   */
  cursor?: ?CursorValue,
|}>;
