import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import {
  type AppBoardState,
  appStateToBackend,
  backendToAppState,
  defaultAppState,
} from '../utils/boardState';

const USER_ID = 'migudavc';
const BOARD_STATE_KEY = ['boardState', USER_ID];

export function useBoardState() {
  const { actor, isFetching } = useActor();

  return useQuery<AppBoardState>({
    queryKey: BOARD_STATE_KEY,
    queryFn: async () => {
      if (!actor) return defaultAppState();
      try {
        const bs = await actor.getBoardState(USER_ID);
        return backendToAppState(bs);
      } catch {
        // Backend traps if no state found — return default
        return defaultAppState();
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useUpdateBoardState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (state: AppBoardState) => {
      if (!actor) throw new Error('Actor not ready');
      const bs = appStateToBackend(state);
      await actor.updateBoardState(USER_ID, bs);
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(BOARD_STATE_KEY, variables);
    },
  });
}
