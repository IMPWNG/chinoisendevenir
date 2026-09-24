import nextVitals from "eslint-config-next/core-web-vitals";

// Native flat config. FlatCompat + next/core-web-vitals crashes ESLint 9
// (circular plugin config). set-state-in-effect is off: existing screens
// load data in effects the same way.
const eslintConfig = [
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default eslintConfig;
