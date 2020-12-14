let MetaTagsJson = require("../assets/metatags.json");

export const getMetaTag = path => {
    const tag = MetaTagsJson.find(t => t.path.indexOf(path) > -1);
    return tag;
};
