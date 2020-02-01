module.exports = {
    "settings": {
        "import/resolver": "webpack",
    },
    "parser": "babel-eslint",
    "plugins": [ "lodash" ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "airbnb-base",
        "plugin:lodash/recommended",
        "prettier"
    ],
    "rules": {
        "quotes": ["warn", "double"],
        "semi": ["error", "always"],
        "react/display-name": [ 0 ],
        "lodash/prefer-lodash-chain": [ 0 ],
        "lodash/prefer-lodash-method": [ 0 ],
        "no-restricted-syntax": [ "error", "WithStatement", "BinaryExpression[operator='in']" ],
        "no-bitwise": [ 0 ]
    }
}