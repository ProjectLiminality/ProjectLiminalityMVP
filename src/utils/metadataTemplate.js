const metadataTemplate = {
  type: 'idea', // Default type
  interactions: 0,
  relatedNodes: [],
  email: '', // New email field
  friendsToNotify: [], // New field for Coherence Beacon
  // Add any other fields you want to ensure are present in all metadata files
};

const getDefaultValue = (key) => {
  if (key in metadataTemplate) {
    return metadataTemplate[key];
  }
  return null; // or any other default value for unknown keys
};

module.exports = {
  metadataTemplate,
  getDefaultValue
};
