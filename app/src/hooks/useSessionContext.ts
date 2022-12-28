import { useContext } from "react";
import { SessionContext } from "~/context/session";

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error(
      "useSessionContext must be used within a SessionContext.Provider"
    );
  }
  return context;
}
