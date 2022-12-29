import { useQuery } from "@tanstack/react-query";
import { supabase } from "~/supabase";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data.session;
    },
  });
}
