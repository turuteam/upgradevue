module.exports = {
  "presets": [
    ["@babel/preset-env"]
  ],
  "plugins":[
    ["@babel/plugin-transform-runtime",
        {
          "regenerator": true
        }
    ],
  ],
  "env": {
    "test": {
      "plugins": [
        ["transform-regenerator", {
            "regenerator": true
        }],
        "@babel/plugin-transform-runtime"
        ],
      "presets": [
        ["@babel/preset-env", {
            "useBuiltIns": false
        }],
        '@vue/cli-plugin-babel/preset'
      ]
    }
  }
}
