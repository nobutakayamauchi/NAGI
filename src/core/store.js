import { createInitialState } from './engine.js';
const KEY = 'nagi.v0.state';

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return createInitialState();
    return { ...createInitialState(), ...JSON.parse(raw) };
  } catch { return createInitialState(); }
}

export function saveState(state, storage = globalThis.localStorage) {
  storage?.setItem(KEY, JSON.stringify(state));
  return state;
}

export function exportState(state) {
  return JSON.stringify(state, null, 2);
}

export function clearState(storage = globalThis.localStorage) { storage?.removeItem(KEY); }
