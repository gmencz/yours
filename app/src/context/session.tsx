import { Session } from "@supabase/supabase-js";
import { createContext, Dispatch, SetStateAction } from "react";

interface SessionContextData {
  session: Session | null;
  setSession: Dispatch<SetStateAction<Session | null>>;
}

export const SessionContext = createContext<SessionContextData | undefined>(
  undefined
);
