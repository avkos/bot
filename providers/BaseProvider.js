const { InstanceError, Model, Op } = require('sequelize');
const { ApiServerError, UNIQUE_NAME_ERR_CODE } = require('../../../core/errors');
const { prepareOrderDirection } = require('../../../utils/helpers');
const { prepareSqlKey, operatorsMap } = require('../../../utils/query');

/**
 * @class BaseProvider
 *
 * @param {Sequelize.Model} Model
 */
class BaseProvider {
  constructor(sequelize, logger) {
    this.sequelize = sequelize;
    this.logger = logger;
    this.Op = Op;
  }

  get Model() {
    // [required] mast be overwritten in child model
    throw Error('Model mast be overwritten provider');
  }

  get includes() {
    return {};
  }

  get defaultOptions() {
    return {};
  }

  async transaction(options) {
    return this.sequelize.transaction(options);
  }

  withScope(model, scope) {
    if (scope) {
      return model.scope(scope.name, scope.data);
    }
    return model;
  }

  applyFilter(builder, filter, op) {
    if (filter && Array.isArray(filter) && filter.length > 0) {
      builder.where = {
        ...builder.where,
        [op]: []
      };
      for (const [key, v] of filter) {
        if (typeof key === 'string' && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
          builder.where[op].push({ [key]: v });
        }
        if (typeof key === 'string' && typeof v === 'object') {
          if (v['$eq'] === null) {
            builder.where[op].push({ [key]: { [this.Op.eq]: null } });
          }
          if (
            v['$ne'] === null ||
            typeof v['$ne'] === 'string' ||
            typeof v['$ne'] === 'number' ||
            typeof v['$ne'] === 'boolean'
          ) {
            builder.where[op].push({ [key]: { [this.Op.ne]: v['$ne'] } });
          }
          if (v['$gte']) {
            builder.where[op].push({ [key]: { [this.Op.gte]: v['$gte'] } });
          }
          if (v['$lte']) {
            builder.where[op].push({ [key]: { [this.Op.lte]: v['$lte'] } });
          }
          if (v['$gt']) {
            builder.where[op].push({ [key]: { [this.Op.gt]: v['$gt'] } });
          }
          if (v['$lt']) {
            builder.where[op].push({ [key]: { [this.Op.lt]: v['$lt'] } });
          }
          if (v['$in'] && Array.isArray(v['$in']) && v['$in'].length > 0) {
            builder.where[op].push({ [key]: { [this.Op.in]: v['$in'] } });
          }
          if (v['$notIn'] && Array.isArray(v['$notIn']) && v['$notIn'].length > 0) {
            builder.where[op].push({ [key]: { [this.Op.notIn]: v['$notIn'] } });
          }
          if (v['$ilike'] && typeof v['$ilike'] === 'string') {
            builder.where[op].push({ [key]: { [this.Op.iLike]: v['$ilike'] } });
          }

          if (v['$like'] && typeof v['$like'] === 'string') {
            builder.where[op].push({
              [this.Op.col]: this.sequelize.where(this.sequelize.fn('lower', this.sequelize.col(key)), {
                [this.Op.like]: v['$like'].toLowerCase()
              })
            });
          }
          if (v['$ilikeCast'] && typeof v['$ilikeCast'] === 'string' && v['cast'] && typeof v['cast'] === 'string') {
            builder.where[op].push(
              this.sequelize.where(this.sequelize.cast(this.sequelize.col(key), v['cast']), {
                [Op.iLike]: v['$ilikeCast']
              })
            );
          }
          if (v['$ilikeNum'] && typeof v['$ilikeNum'] === 'string') {
            const col = this.sequelize.cast(this.sequelize.col(key), 'text');
            builder.where[op].push(this.sequelize.where(col, { [this.Op.iLike]: v['$ilikeNum'] }));
          }
        }
      }
    }
    return builder;
  }

  applyFilterNaked(builder, filter, op) {
    if (!Array.isArray(filter)) return builder;
    const where = [];

    filter.forEach(([key, val]) => {
      if (typeof key !== 'string') return;
      const sqlKey = prepareSqlKey({
        key,
        tableAlias: this.Model.getTableName(),
        attributes: this.Model.rawAttributes
      });

      if (typeof val === 'string' || typeof val === 'number') {
        where.push(`${sqlKey}=${this.sequelize.escape(val)}`);
      } else if (typeof val === 'object') {
        const opKey = Object.keys(val)[0];
        if (!operatorsMap[opKey]) return;

        where.push(
          `${sqlKey} ${operatorsMap[opKey]} ${
            Array.isArray(val[opKey])
              ? `(${val[opKey].map((v) => this.sequelize.escape(v)).join(',')})`
              : this.sequelize.escape(val[opKey])
          }`
        );
      }
    });

    if (where.length > 0) {
      builder.where = `${builder.where ? `${builder.where} AND ` : ''}(${where.join(
        op === this.Op.and ? ' AND ' : ' OR '
      )})`;
    }

    return builder;
  }

  /**
   * @param {*} data
   * @param {boolean} withCount
   * @param {*} [options]
   * @return {Promise<{items: Model[], total: number}>|Promise<Model[]>}
   */
  getFilteredList(data, withCount = false, options = undefined) {
    const query = this.getFilteredQuery(data);
    return this.getList(Object.assign({}, options, query), withCount);
  }

  getOrderParams(order = []) {
    if (!Array.isArray(order)) return undefined;

    return order.map((orderPair) => {
      // example 'name'
      if (!Array.isArray(orderPair)) return orderPair;

      const [orderBy, orderDir] = orderPair;
      const orderDirection = prepareOrderDirection(orderDir);

      // order by associations, example [['user', 'name'], 'asc']
      if (Array.isArray(orderBy)) {
        const [model, modelField] = orderBy;
        return [this.Model.associations[model] || model, modelField, orderDirection];
      }

      // example ['name', 'desc'] || ['type.name', 'desc']
      if (typeof orderBy === 'string') {
        return this.sequelize.literal(`"${orderBy}" ${orderDirection}`);
      }

      // all others
      return [orderBy, orderDirection];
    });
  }

  getOrderParamsNaked(order = []) {
    if (!Array.isArray(order)) return undefined;

    return order
      .map((orderPair) => {
        // example 'name'
        if (!Array.isArray(orderPair)) return `"${orderPair}"`;

        const [orderBy, orderDir] = orderPair;
        const orderDirection = prepareOrderDirection(orderDir);

        // order by associations, example [['user', 'name'], 'asc']
        if (Array.isArray(orderBy)) {
          const [model, modelField] = orderBy;
          return `"${model}"."${modelField}" ${orderDirection}`;
        }

        return `"${orderBy}" ${orderDirection}`;
      })
      .join(', ');
  }

  getFilteredQuery(data = {}) {
    let builder = {};
    builder = this.applyFilter(builder, data.filter, this.Op.and);
    builder = this.applyFilter(builder, data.orFilter, this.Op.or);

    if (data.limit && typeof data.limit === 'number') {
      builder.limit = data.limit;
    }
    if (data.offset && typeof data.offset === 'number') {
      builder.offset = data.offset;
    }
    if (data.order && Array.isArray(data.order)) {
      builder.order = this.getOrderParams(data.order);
    }

    return builder;
  }

  getFilteredQueryNaked(data = {}) {
    let builder = {};
    builder = this.applyFilterNaked(builder, data.filter, this.Op.and);
    builder = this.applyFilterNaked(builder, data.orFilter, this.Op.or);

    if (data.limit && typeof data.limit === 'number') {
      builder.limit = data.limit;
    }
    if (data.offset && typeof data.offset === 'number') builder.offset = data.offset;

    if (data.order && Array.isArray(data.order)) {
      builder.order = this.getOrderParamsNaked(data.order);
    }

    return builder;
  }
  getList(query, withCount = false) {
    const findOptions = Object.assign({}, this.defaultOptions, query);
    if (withCount) {
      return this.Model.findAndCountAll(findOptions).then((res) => {
        return {
          total: res.count,
          items: res.rows
        };
      });
    }
    return this.Model.findAll(findOptions);
  }

  getCount(query) {
    return this.Model.count(query).catch(() => 0);
  }

  get models() {
    return this.sequelize.models;
  }

  async create(data, options = undefined) {
    return this.Model.create(data, { ...options });
  }

  async update(where, data, options = undefined) {
    const res = await this.Model.unscoped().update(data, { where, ...options });

    return Boolean(res && res[0]);
  }

  async updateById(id, data, options = undefined) {
    return this.update({ id }, data, options);
  }

  async updateModel(model, values, options = undefined) {
    return model instanceof Model
      ? model.update(values, options)
      : Promise.reject(new InstanceError('It mast be instance of Model'));
  }

  async delete(where, options = undefined) {
    return await this.Model.unscoped().destroy({ where, ...options });
  }

  async deleteById(id, options = undefined) {
    return this.delete({ id }, options);
  }

  async deleteModel(model, options = undefined) {
    return model instanceof Model
      ? model.destroy(options)
      : Promise.reject(new InstanceError('It mast be instance of Model'));
  }

  async isExist(where, options = undefined) {
    return this.Model.count({ where, ...options }).then(
      (value) => Boolean(value),
      () => false
    );
  }

  async uniqueNameCheck({ name, id }, entity = 'Item', key = 'name') {
    const item = await this.Model.findOne({ where: { [key]: name, deletedAt: null } });
    if (item && Number(item.id) !== Number(id))
      throw new ApiServerError(`${entity} with the current name already exist.`, UNIQUE_NAME_ERR_CODE, item);
  }

  async getById(id, options = undefined) {
    return this.Model.unscoped().findByPk(id, { ...this.defaultOptions, ...options });
  }

  async findOne(where = {}, options = undefined) {
    return this.Model.unscoped().findOne({ ...this.defaultOptions, ...options, where });
  }

  async getModel(idOrModel, ...args) {
    return idOrModel instanceof Model ? idOrModel : this.getById(idOrModel, ...args);
  }

  async total(data) {
    return this.getCount(this.getFilteredQuery(data)).then((total) => ({ total }));
  }
}

module.exports = BaseProvider;
