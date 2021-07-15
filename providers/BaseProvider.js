const { InstanceError, Model, Op } = require('sequelize')

/**
 * @class BaseProvider
 *
 * @param {Sequelize.Model} Model
 */
class BaseProvider {
  constructor(sequelize, logger) {
    this.sequelize = sequelize
    this.logger = logger
    this.Op = Op
  }

  get Model() {
    // [required] mast be overwritten in child model
    throw Error('Model mast be overwritten provider')
  }

  get includes() {
    return {}
  }

  get defaultOptions() {
    return {}
  }

  async transaction(options) {
    return this.sequelize.transaction(options)
  }

  getCount(query) {
    return this.Model.count(query).catch(() => 0)
  }

  get models() {
    return this.sequelize.models
  }

  async create(data, options = undefined) {
    return this.Model.create(data, { ...options })
  }

  async update(where, data, options = undefined) {
    const res = await this.Model.unscoped().update(data, { where, ...options })

    return Boolean(res && res[0])
  }

  async updateById(id, data, options = undefined) {
    return this.update({ id }, data, options)
  }

  async updateModel(model, values, options = undefined) {
    return model instanceof Model
      ? model.update(values, options)
      : Promise.reject(new InstanceError('It mast be instance of Model'))
  }

  async delete(where, options = undefined) {
    return await this.Model.unscoped().destroy({ where, ...options })
  }

  async deleteById(id, options = undefined) {
    return this.delete({ id }, options)
  }

  async deleteModel(model, options = undefined) {
    return model instanceof Model
      ? model.destroy(options)
      : Promise.reject(new InstanceError('It mast be instance of Model'))
  }

  async isExist(where, options = undefined) {
    return this.Model.count({ where, ...options }).then(
      (value) => Boolean(value),
      () => false,
    )
  }

  async getById(id, options = undefined) {
    return this.Model.unscoped().findByPk(id, { ...this.defaultOptions, ...options })
  }

  async findOne(where = {}, options = undefined) {
    return this.Model.unscoped().findOne({ ...this.defaultOptions, ...options, where })
  }

  async getModel(idOrModel, ...args) {
    return idOrModel instanceof Model ? idOrModel : this.getById(idOrModel, ...args)
  }
}

module.exports = BaseProvider
