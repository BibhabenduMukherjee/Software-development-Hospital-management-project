class Custom extends Error {
  constructor(statusCode, message) {
    super();
    this.statusCode = statusCode;
    this.message = message;
  }

  static alreadyExists() {
    return new Custom(this.statusCode, this.message);
  }
}
module.exports = Custom;
