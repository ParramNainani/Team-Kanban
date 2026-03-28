"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type PersonaId =
  | "student"
  | "women"
  | "farmer"
  | "job"
  | "startup"
  | "senior"
  | "rural";

type Ctx = {
  persona: PersonaId;
  setPersona: (id: PersonaId) => void;
  activeFeatureId: string | null;
  setActiveFeatureId: (id: string | null) => void;
  activeStep: number;
  setActiveStep: (n: number) => void;
};

const LandingContext = createContext<Ctx | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaId>("student");
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(
    "matching"
  );
  const [activeStep, setActiveStep] = useState(0);

  const setPersona = useCallback((id: PersonaId) => setPersonaState(id), []);

  const value = useMemo(
    () => ({
      persona,
      setPersona,
      activeFeatureId,
      setActiveFeatureId,
      activeStep,
      setActiveStep,
    }),
    [persona, setPersona, activeFeatureId, activeStep]
  );

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
}

export function useLanding() {
  const c = useContext(LandingContext);
  if (!c) throw new Error("useLanding inside LandingProvider");
  return c;
}
