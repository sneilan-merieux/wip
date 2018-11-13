module.exports = {
  debug: true,
  apiMatch: [
    "https://api.github.com/**"
  ],
  server: {
    command: 'npm run start:test',
    port: 8001
  }
}
