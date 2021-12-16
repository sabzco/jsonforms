import isEqual from 'lodash/isEqual';
import type { EffectCallback } from 'react';
import { useEffect, useRef } from 'react';

// https://stackoverflow.com/a/54096391/5318303
const useDeepMemorize = (value: any) => {
  const ref = useRef();

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
};

const useDeepMemorizes = (...values: any[]) => values.map(useDeepMemorize);

export const useDeepEffect = (callback: EffectCallback, values: any[]) =>
  useEffect(callback, useDeepMemorizes(...values));

export default useDeepEffect;
