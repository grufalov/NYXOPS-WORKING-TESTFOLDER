import * as React from 'react';

/**
 * Wrap a component with local flag overrides applied for the lifetime of that component.
 * @param {React.ComponentType<any>} Component
 * @param {Record<string, boolean>} overrides
 */
export function withLocalFlags(Component, overrides) {
  const Wrapped = (props) => {
    React.useEffect(() => {
      const w = /** @type {any} */(globalThis?.window);
      if (!w) return;
      const prev = w.__FLAG_OVERRIDES__;
      w.__FLAG_OVERRIDES__ = { ...(prev || {}), ...(overrides || {}) };
      return () => {
        w.__FLAG_OVERRIDES__ = prev;
      };
    }, []);
    return React.createElement(Component, props);
  };
  Wrapped.displayName = `WithLocalFlags(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
}
