import React, { createContext, useContext, useState } from 'react';

export interface PromptEntry {
  question: string;
  answer: string;
}

export interface RegistrationData {
  phone?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  dob?: string;          // ISO string, e.g. "1998-04-15T00:00:00.000Z"
  latitude?: number | null;
  longitude?: number | null;
  gender?: string;
  preferredGender?: string;
  datingType?: string;
  hometown?: string | null;
  religion?: string | null;
  occupation?: string | null;
  bio?: string | null;
  photos?: string[];     // local URIs
  prompts?: PromptEntry[];
}

interface RegistrationContextType {
  data: RegistrationData;
  update: (fields: Partial<RegistrationData>) => void;
  reset: () => void;
}

const defaultData: RegistrationData = {};

const RegistrationContext = createContext<RegistrationContextType>({
  data: defaultData,
  update: () => {},
  reset: () => {},
});

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RegistrationData>(defaultData);

  const update = (fields: Partial<RegistrationData>) =>
    setData((prev) => ({ ...prev, ...fields }));

  const reset = () => setData(defaultData);

  return (
    <RegistrationContext.Provider value={{ data, update, reset }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export const useRegistration = () => useContext(RegistrationContext);
