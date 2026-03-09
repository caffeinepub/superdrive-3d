import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PlayerScore } from "../backend.d";
import { useActor } from "./useActor";

export function useTopScores(limit = 10) {
  const { actor, isFetching } = useActor();
  return useQuery<PlayerScore[]>({
    queryKey: ["topScores", limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopScores(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      distance,
      carIndex,
    }: {
      name: string;
      distance: number;
      carIndex: number;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.submitScore(name, distance, BigInt(carIndex));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topScores"] });
    },
  });
}
