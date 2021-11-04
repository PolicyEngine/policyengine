const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
        plugin: CracoLessPlugin,
        options: {
            lessLoaderOptions: {
                lessOptions: {
                    modifyVars: {
                        "primary-color": "#2c6496",
                        "primary-1": "#fff",
                        "link-color": "#002766",
                        "success-color": "#0DD078",
                        "border-radius-base": "40px",
                    },
                    javascriptEnabled: true,
                },
            },
        },
    },
]};
