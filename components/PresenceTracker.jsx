import { usePresence } from '../hooks/usePresence';

const PresenceTracker = ({ userId }) => {
  usePresence(userId);
  return null;
};

export default PresenceTracker;
