module.exports = ms => new Promise((resolve, reject) => {
  setTimeout(() => { resolve() }, ms)
})