export function getFanAvatar(fan) {
  if (fan.avatar) {
    return fan.avatar;
  }

  const fbId =
    fan.additionalInfo &&
    fan.additionalInfo.social &&
    fan.additionalInfo.social.facebook &&
    fan.additionalInfo.social.facebook.userId;

  if (fbId) {
    return `https://graph.facebook.com/${fbId}/picture?type=large`;
  }

  // TODO: Handle Instagram

  return null;
}
