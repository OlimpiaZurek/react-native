/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import type ReactNativeElement from '../../DOM/Nodes/ReactNativeElement';
import typeof ReactFabricType from '../../Renderer/shims/ReactFabric';
import type {
  InternalInstanceHandle,
  Node,
  ViewConfig,
} from '../../Renderer/shims/ReactNativeTypes';
import type ReactFabricHostComponent from './ReactFabricHostComponent';

import ReactNativeFeatureFlags from '../ReactNativeFeatureFlags';

// Lazy loaded to avoid evaluating the module when using the legacy renderer.
let PublicInstanceClass:
  | Class<ReactFabricHostComponent>
  | Class<ReactNativeElement>;

// Lazy loaded to avoid evaluating the module when using the legacy renderer.
let ReactFabric: ReactFabricType;

export function createPublicInstance(
  tag: number,
  viewConfig: ViewConfig,
  internalInstanceHandle: InternalInstanceHandle,
): ReactFabricHostComponent | ReactNativeElement {
  if (PublicInstanceClass == null) {
    // We don't use inline requires in react-native, so this forces lazy loading
    // the right module to avoid eagerly loading both.
    if (ReactNativeFeatureFlags.enableAccessToHostTreeInFabric()) {
      PublicInstanceClass =
        require('../../DOM/Nodes/ReactNativeElement').default;
    } else {
      PublicInstanceClass = require('./ReactFabricHostComponent').default;
    }
  }

  return new PublicInstanceClass(tag, viewConfig, internalInstanceHandle);
}

export function createPublicTextInstance(internalInstanceHandle: mixed): {} {
  // React will call this method to create text instances but we'll return an
  // empty object for now. These instances are only created lazily when
  // traversing the tree, and that's not enabled yet.
  return {};
}

export function getNativeTagFromPublicInstance(
  publicInstance: ReactFabricHostComponent | ReactNativeElement,
): number {
  return publicInstance.__nativeTag;
}

export function getNodeFromPublicInstance(
  publicInstance: ReactFabricHostComponent | ReactNativeElement,
): ?Node {
  // Avoid loading ReactFabric if using an instance from the legacy renderer.
  if (publicInstance.__internalInstanceHandle == null) {
    return null;
  }

  if (ReactFabric == null) {
    ReactFabric = require('../../Renderer/shims/ReactFabric');
  }
  return ReactFabric.getNodeFromInternalInstanceHandle(
    publicInstance.__internalInstanceHandle,
  );
}
