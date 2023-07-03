export const hubspotWhitelistPaths = [
  '/authenticate/signup',
  '/authenticate/import-sales-data',
  '/authenticate/billing-details',
];

// Return a string for any "Back to..." link, based on the value of the path being returned to
export function backToText(backPath) {
  if ((backPath || "").startsWith("/dashboard")) {
    return `Back to dashboard`
  } else if ((backPath || "").startsWith("/message-center/messages/")) {
    return "Back to message"
  } else if ((backPath || "").startsWith("/message-center/messages")) {
    return "Back to messages"
  } else if ((backPath || "").startsWith("/message-center/lists/")) {
    return "Back to list"
  } else if ((backPath || "").startsWith("/message-center/lists")) {
    return "Back to lists"
  } else if ((backPath || "").startsWith("/message-center")) {
    return "Back to message center"
  } else if ((backPath || "").startsWith("/events/")) {
    return "Back to event"
  } else if ((backPath || "").startsWith("/events")) {
    return "Back to events"
  } else if ((backPath || "").startsWith("/campaigns/")) {
    return "Back to campaign"
  } else if ((backPath || "").startsWith("/campaigns")) {
    return "Back to campaigns"
  } else if ((backPath || "").startsWith("/tours/")) {
    return "Back to tour"
  } else if ((backPath || "").startsWith("/tours")) {
    return "Back to tours"
  } else if ((backPath || "").startsWith("/audience/")) {
    return "Back to contact"
  } else if ((backPath || "").startsWith("/audience")) {
    return "Back to audience"
  }
  return "Back"
}
