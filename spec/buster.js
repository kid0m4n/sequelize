var config = module.exports

config["node tests"] = {
  environment: "node",
  rootPath: "../",
  tests: [
    "spec/**/dao.spec.js",
    "spec/**/dao-factory.spec.js",
    "spec/**/dao.validations.spec.js",
    "spec/**/data-types.spec.js",
    "spec/**/migrator.spec.js",
    "spec/**/query-chainer.spec.js",
    "spec/**/query-interface.spec.js",
    "spec/**/sequelize.spec.js"
  ]
}
