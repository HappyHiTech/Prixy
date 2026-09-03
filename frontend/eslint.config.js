// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const perfectionist = require("eslint-plugin-perfectionist");

// Mirrors the property-order groups used by stylelint-order in other
// projects, adapted to React Native's StyleSheet property names.
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
          },
          // Properties are grouped by category below; within each group,
          // properties sort alphabetically rather than in a fixed order.
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
          // Fallback for every object that isn't a StyleSheet.create call:
          // leave key order untouched.
          type: "unsorted",
        },
      ],
    },
  },
]);
