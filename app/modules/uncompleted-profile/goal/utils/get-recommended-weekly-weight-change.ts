import { Profile } from "modules/auth/hooks/use-profile-query";

const ONE_KG_IN_LBS = 2.205;
export function getRecommendedWeeklyWeightChange(
  approach: "bulk" | "cut" | "maintain",
  profile: Profile
): { kgs: number; lbs: number } {
  switch (approach) {
    case "bulk": {
      // Gain 1% of your BW as a male per month and 0.5% as a female which
      // is 0.25% of your BW as a male per week.
      const percentage = profile.gender === "male" ? 1 : 0.5;
      let monthlyKgsChange = (profile!.initial_weight! / 100) * percentage;
      monthlyKgsChange = monthlyKgsChange > 1 ? 1 : monthlyKgsChange;
      const weeklyKgsChange = monthlyKgsChange / 4;
      const weeklyLbsChange = weeklyKgsChange * ONE_KG_IN_LBS;
      return { kgs: weeklyKgsChange, lbs: weeklyLbsChange };
    }
    case "cut": {
      // Lose 1.25% of your BW per month which is around 0.3% as a male per week.
      const percentage = 1.25;
      const monthlyKgsChange = (profile!.initial_weight! / 100) * percentage;
      const weeklyKgsChange = monthlyKgsChange / 4;
      const weeklyLbsChange = weeklyKgsChange * ONE_KG_IN_LBS;
      return { kgs: -weeklyKgsChange, lbs: -weeklyLbsChange };
    }
    default:
      // Maintain so the recommended weekly weight change is 0.
      return { kgs: 0, lbs: 0 };
  }
}
