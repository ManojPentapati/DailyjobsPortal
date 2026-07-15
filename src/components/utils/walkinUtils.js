export const parseWalkinData = (description) => {
  if (!description) return null;
  const match = description.match(/<!--WALKIN_DATA:(.*?)-->/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse walk-in data", e);
    }
  }
  return null;
};

export const cleanDescription = (description) => {
  if (!description) return "";
  return description.replace(/<!--WALKIN_DATA:(.*?)-->/, "").trim();
};

export const serializeWalkinData = (description, walkinData) => {
  const cleaned = cleanDescription(description);
  if (!walkinData || !walkinData.venue || !walkinData.dateTime) {
    return cleaned;
  }
  return `${cleaned}\n\n<!--WALKIN_DATA:${JSON.stringify(walkinData)}-->`;
};
