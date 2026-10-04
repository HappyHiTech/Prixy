const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const perfectionist = require("eslint-plugin-perfectionist");

const positioning = ["position", "zIndex", "top", "right", "bottom", "left"];
const layout = [
  "display",
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "flexDirection",
  "flexWrap",
  "gap",
  "rowGap",
  "columnGap",
  "justifyContent",
  "alignItems",
  "alignContent",
  "alignSelf",
];
const boxModel = [
  "width",
  "minWidth",
  "maxWidth",
  "height",
  "minHeight",
  "maxHeight",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginHorizontal",
  "marginVertical",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingHorizontal",
  "paddingVertical",
];
const visual = [
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomLeftRadius",
  "borderBottomRightRadius",
  "backgroundColor",
  "opacity",
  "shadowColor",
  "shadowOffset",
  "shadowOpacity",
  "shadowRadius",
  "elevation",
];
const typeMisc = [
  "color",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textDecorationLine",
  "textTransform",
];

const styleProperties = [
  ...positioning,
  ...layout,
  ...boxModel,
  ...visual,
  ...typeMisc,
];
const styleObjectKeyPattern = `^(${styleProperties.join("|")})$`;

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: { perfectionist },
    rules: {
      "perfectionist/sort-objects": [
        "warn",
        {
          useConfigurationIf: {
            callingFunctionNamePattern: {
              pattern: "^StyleSheet\\.create$",
              scope: "deep",
            },
            allNamesMatchPattern: styleObjectKeyPattern,
          },
          type: "alphabetical",
          customGroups: [
            { groupName: "positioning", elementNamePattern: positioning },
            { groupName: "layout", elementNamePattern: layout },
            { groupName: "boxModel", elementNamePattern: boxModel },
            { groupName: "visual", elementNamePattern: visual },
            { groupName: "typeMisc", elementNamePattern: typeMisc },
          ],
          groups: [
            "positioning",
            "layout",
            "boxModel",
            "visual",
            "typeMisc",
            "unknown",
          ],
        },
        {
          type: "unsorted",
        },
      ],
    },
  },
]);
