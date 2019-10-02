module.exports = api => ({
    plugins: api.env('test') ? ['babel-plugin-rewire'] : [],
    presets: [
        ['@babel/preset-env', {
            targets: {
                node: 'current'
            }
        }]
    ]
});