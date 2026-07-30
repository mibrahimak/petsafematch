import { usePresence } from '../hooks/usePresence';

const PresenceTracker = ({ userId, showOnlineStatus = true }) => {
  usePresence(userId, showOnlineStatus);
  return null;
};

export default PresenceTracker;
