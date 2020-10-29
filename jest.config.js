module.exports = {
  preset: '@nuxt/test-utils',
  transform: {
    '\\.(js|ts)$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env', '@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-runtime']
      }
    ]
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**']
}
