import isEqual from 'lodash/isEqual';
import type { EffectCallback } from 'react';
import { useEffect, useMemo, useRef } from 'react';

// https://stackoverflow.com/a/54096391/5318303
export const useDeepMemorize = (object: any) => {
  const ref = useRef();

  if (!isEqual(object, ref.current)) {
    ref.current = object;
  }

  return ref.current;
};

export const useDeepMemorizes = (objects: any[]) => objects.map(useDeepMemorize);

export const useDeepEffect = (callback: EffectCallback, dependencies: any[]) =>
  useEffect(callback, useDeepMemorizes(dependencies));

export const useDeepMemo = <T>(factory: () => T, dependencies: any[]): T =>
  useMemo(factory, useDeepMemorizes(dependencies));

export default useDeepEffect;
