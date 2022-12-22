import { useQuery } from "@tanstack/react-query";
import { supabase } from "modules/supabase/client";
import { EstimationsQueryData } from "../screens/energy-expenditure/root";

interface UseTdeeEstimationsQuery {
  profileId: string;
}

export function useTdeeEstimationsQuery({
  profileId,
}: UseTdeeEstimationsQuery) {
  return useQuery({
    queryKey: ["tdeeEstimations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles_tdee_estimations")
        .select<string, EstimationsQueryData[number]>(
          "id, estimation, date_of_first_estimated_item, date_of_last_estimated_item"
        )
        .eq("profile_id", profileId)
        .order("date_of_last_estimated_item", { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    },
  });
}
