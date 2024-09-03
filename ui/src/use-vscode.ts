import { useReducer } from 'react';

type VsCodeState = Record<string, unknown>;

const vscode = acquireVsCodeApi<VsCodeState>();

export const postMessage = vscode.postMessage;

export const useVscode = () => {
  const initialState: VsCodeState = vscode.getState() || {};

  const [state, dispatch] = useReducer(
    (state: VsCodeState = {}, next: VsCodeState): VsCodeState => {
      return { ...state, ...next };
    },
    initialState,
  );

  return [state, dispatch] as const;
};
