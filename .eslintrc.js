module.exports = {
    "root": true,
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 6
    },
    "rules": {
        // just ignore the fucking line break style...
        "linebreak-style": ["error", process.platform === 'win32' ? "windows" : "unix"]
    },
    "extends": "google"
};