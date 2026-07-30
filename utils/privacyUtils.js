export const shouldShowDistance = (profile) => profile?.share_distance !== false;

export const shouldHideExactLocation = (profile) =>
  profile?.hide_exact_location === true;

export const getVisibleLastSeen = (profile) => {
  if (profile?.show_online_status === false) {
    return null;
  }

  return profile?.last_seen_at ?? null;
};
