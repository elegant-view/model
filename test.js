var devServer = require('dev-server');

devServer.start({
    rootPath: __dirname,
    babel: {
        compileOptions: {
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-es2015-modules-amd']
        },
        include: [/^\/(src|test)\/.+\.js$/, /^\/node_modules\/event\/.+\.js$/]
    }
});
