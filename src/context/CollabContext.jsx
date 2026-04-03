import { createContext, useContext, useState } from 'react';

const CollabContext = createContext();

export const useCollab = () => useContext(CollabContext);

export const CollabProvider = ({ children }) => {
  // Empty states to ensure no ghost users, reactions, or extra presence badges show up.
  // Active viewers is locked to 1 (just you).
  const [ghostUsers, setGhostUsers] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [activeViewers, setActiveViewers] = useState(1);
  const [liveReactions, setLiveReactions] = useState([]);

  return (
    <CollabContext.Provider value={{ ghostUsers, reactions, activeViewers, liveReactions }}>
      {children}
    </CollabContext.Provider>
  );
};
