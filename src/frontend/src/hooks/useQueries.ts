import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AppBoardState,
  appStateToBackend,
  backendToAppState,
  defaultAppState,
  ensureMiguelCard,
  normalizeSnhuCards,
} from "../utils/boardState";
import { useActor } from "./useActor";

const USER_ID = "migudavc";
const BOARD_STATE_KEY = ["boardState", USER_ID];

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useBoardState() {
  const { actor, isFetching } = useActor();

  return useQuery<AppBoardState>({
    queryKey: BOARD_STATE_KEY,
    queryFn: async () => {
      if (!actor) return defaultAppState();

      try {
        const bs = await actor.getBoardState(USER_ID);

        // If the backend returned the seed/empty state (no real data saved yet),
        // fall back to the canonical default so canonical cards are always present.
        if (bs.staffCards.length === 0 && bs.courseCards.length === 0) {
          return defaultAppState();
        }

        const appState = backendToAppState(bs);

        // Always ensure canonical cards are present after deserialization
        return {
          staffing: { cards: ensureMiguelCard(appState.staffing.cards) },
          university: { cards: normalizeSnhuCards(appState.university.cards) },
        };
      } catch {
        // Backend unreachable — return default seed state
        return defaultAppState();
      }
    },
    enabled: !!actor && !isFetching,
    // Poll every 5 seconds so changes on one device appear on all others
    refetchInterval: 5000,
    // Allow background refetches to pick up remote changes
    staleTime: 4000,
  });
}

export function useUpdateBoardState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    AppBoardState,
    { previousState: AppBoardState | undefined }
  >({
    retry: 0, // No silent retries — surface errors immediately
    mutationFn: async (state: AppBoardState) => {
      if (!actor)
        throw new Error("Backend not available. Please refresh and try again.");
      const backendState = appStateToBackend(state);
      await actor.setBoardState(backendState);
    },
    onMutate: async (newState) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: BOARD_STATE_KEY });

      // Snapshot the previous value for rollback
      const previousState =
        queryClient.getQueryData<AppBoardState>(BOARD_STATE_KEY);

      // Optimistically update the cache immediately so the UI feels instant
      queryClient.setQueryData<AppBoardState>(BOARD_STATE_KEY, newState);

      return { previousState };
    },
    onSuccess: () => {
      // Invalidate and refetch to confirm the backend has the latest state
      queryClient.invalidateQueries({ queryKey: BOARD_STATE_KEY });
    },
    onError: (_error, _variables, context) => {
      // Roll back to the previous state on failure
      if (context?.previousState !== undefined) {
        queryClient.setQueryData<AppBoardState>(
          BOARD_STATE_KEY,
          context.previousState,
        );
      }
    },
  });
}
