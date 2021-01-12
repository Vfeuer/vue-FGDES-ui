// const prodPlugins = []
// if (process.env.NODE_ENV === 'production') {
//   prodPlugins.push('transform-remove-cnosole')
// }

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // remove cnosole command after production process
    // ...prodPlugins
    'transform-remove-console'
  ]
}
