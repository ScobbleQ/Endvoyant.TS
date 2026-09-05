export function profileVisibility({
  isOwner,
  accountPrivate,
  ownerPrivate,
  viewerPrivate,
}: {
  isOwner: boolean;
  accountPrivate: boolean;
  ownerPrivate: boolean;
  viewerPrivate: boolean;
}) {
  const privateProfile = accountPrivate || ownerPrivate;
  return {
    allowed: isOwner || !privateProfile,
    ephemeral: privateProfile || viewerPrivate,
  };
}
