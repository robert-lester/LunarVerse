const AWS = require('aws-sdk');
const NullTableException = require('./exceptions/NullTableException');

const BATCH_GET_CHUNK_SIZE_LIMIT = 100;
const BATCH_PUT_CHUNK_SIZE_LIMIT = 25;

// Build an attribute name map to allow us to update Dynamo rows with reserved field names
const buildAttributeNameMap = attributes =>
  Object.keys(attributes).reduce((attrs, attr) => {
    const newAttrs = attrs;
    newAttrs[`#${attr}`] = attr;
    return newAttrs;
  }, {});

// Build a corresponding attribute value map to go with our attribute name map
const buildAttributeValueMap = attributes =>
  Object.keys(attributes).reduce((attrs, attr) => {
    const newAttrs = attrs;
    newAttrs[`:${attr}`] = attributes[attr];
    return newAttrs;
  }, {});

const flatten = arrays =>
  arrays.reduce((flatArray, array) =>
    flatArray.concat(array), []);

/**
 * Wrap a DynamoDB table in a Promise-based CRUD interface
 * @alias module:NosQL
 */
class NosQL {
  /**
   * Creates an instance of a NosQL object
   * @param {Object=} config An optional AWS configuration for the DynamoDB instance
   */
  constructor(config = { region: 'us-east-1' }) {
    AWS.config.update(config);

    this.client = new AWS.DynamoDB.DocumentClient();
    this.table = null;
    this.primaryKey = null;
    this.config = config;
  }

  /**
   * Set the table to query for this object's instance
   * @param {string} table The Dynamo table to query on
   * @param {string|number} primaryKey The table's primary key
   */
  setTable(table, primaryKey) {
    this.table = table;
    this.primaryKey = primaryKey;
  }

  /**
   * Retrieve all resources from a table
   * @returns {Promise<Object>} A promise containing an array of resources
   */
  index() {
    if (this.table === null || this.primaryKey === null) {
      throw new NullTableException();
    }

    return this.client.scan({
      TableName: this.table,
    }).promise()
      .then(result => result.Items);
  }

  /**
   * Create a new resource in the table
   * @param {string} primaryKey The DynamoDB key that should be used
   * @param {object} attributes A map of attributes to add to the new resource
   * @param {object} options A map of options for the create operation
   * @param {boolean} [options.timestamps=true] Include UNIX timestamps in the new resource
   * @returns {Promise<Object>} A promise containing the fields of the new resource
   */
  create(primaryKey, attributes, options = { timestamps: true }) {
    if (this.table === null || this.primaryKey === null) {
      throw new NullTableException();
    }

    const itemAttributes = Object.assign(attributes, { [this.primaryKey]: primaryKey });

    if (options.timestamps) {
      const currentTime = Date.now();

      itemAttributes.createdAt = currentTime;
      itemAttributes.updatedAt = currentTime;
    }

    return this.client.put({
      TableName: this.table,
      Item: itemAttributes,
      ConditionExpression: 'attribute_not_exists(id)',
    }).promise()
      .then(() => itemAttributes);
  }

  /**
   * Create a list of records
   * @param {array} attributeList An array of record objects (each should include an ID)
   * @param {object} options A map of options for the batchCreate operation
   * @param {boolean} [options.timestamp=true] Include UNIX timestamps in the new resources
   * @returns {Promise<Object>} A promise containing an array of new records
   */
  batchWrite(attributeList, options = { timestamps: true }) {
    const batches = [];

    // Slice the incoming records into batches of the maximum DynamoDB PUT request limit
    for (let i = 0, l = attributeList.length; i < l; i += BATCH_PUT_CHUNK_SIZE_LIMIT) {
      batches.push(attributeList.slice(i, i + BATCH_PUT_CHUNK_SIZE_LIMIT));
    }

    // Return a promise that will be fulfilled after each batch of records is successfully written
    return Promise.all(batches.map(batch => this.client.batchWrite({
      RequestItems: {
        // Map the request body for each batch
        [this.table]: batch.map(itemAttributes => ({
          PutRequest: {
            // Add timestamps if necessary
            Item: options.timestamps ? Object.assign(itemAttributes, {
              [this.primaryKey]: itemAttributes[this.primaryKey],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }) : Object.assign(itemAttributes, {
              [this.primaryKey]: itemAttributes[this.primaryKey],
            }),
          },
        })),
      },
    }).promise()));
  }

  /**
   * Get the table entry for a resource
   * @param {string} primaryKey The DynamoDB key for the resource
   * @returns {Promise<Object>} A promise containing the resource
   */
  read(primaryKey) {
    if (this.table === null || this.primaryKey === null) {
      throw new NullTableException();
    }

    return this.client.get({
      TableName: this.table,
      Key: { [this.primaryKey]: primaryKey },
    }).promise()
      .then(result => result.Item);
  }

  /**
   * Get the table entries for multiple resources
   * @param {array} primaryKeys An array of DynamoDB ids for the resources
   * @returns {Promise<Object>} A promise containing the resources
   */
  batchRead(primaryKeys) {
    const batches = [];

    // Slice the requested record IDs into batches of the maximum DynamoDB GET request limit
    for (let i = 0, l = primaryKeys.length; i < l; i += BATCH_GET_CHUNK_SIZE_LIMIT) {
      batches.push(primaryKeys.slice(i, i + BATCH_GET_CHUNK_SIZE_LIMIT));
    }

    // Map the request body for each batch
    return Promise.all(batches.map(batch => this.client.batchGet({
      RequestItems: {
        [this.table]: {
          Keys: batch.map(primaryKey => ({ [this.primaryKey]: primaryKey })),
        },
      },
    }).promise()))
      .then(resultBatches => resultBatches.map(batch => batch.Responses[this.table]))
      .then(flatten);
  }

  /**
   * Update the table entry for a resource
   * @param {string} primaryKey The DynamoDB key that should be used
   * @param {object} attributes A map of attributes to update on the resource
   * @param {object} options A map of options for the create operation
   * @param {boolean} [options.timestamps=true] Update the UNIX timestamps on the resource
   * @returns {Promise} A promise containing the resource
   */
  update(primaryKey, attributes, options = { timestamps: true }) {
    if (this.table === null || this.primaryKey === null) {
      throw new NullTableException();
    }

    const itemAttributes = attributes;

    if (options.timestamps) {
      itemAttributes.updatedAt = Date.now();
    }

    return this.client.update({
      TableName: this.table,
      Key: { [this.primaryKey]: primaryKey },
      ExpressionAttributeNames: buildAttributeNameMap(itemAttributes),
      ExpressionAttributeValues: buildAttributeValueMap(itemAttributes),
      UpdateExpression: `SET ${Object.keys(itemAttributes).map(attr => `#${attr} = :${attr}`).join(', ')}`,
      ReturnValues: 'ALL_NEW',
    }).promise()
      .then(result => result.Attributes);
  }
  /**
   * Update the table entry for a resource
   * @param {string} key The DynamoDB key that should be used
   * @param {string} value The value to be searched in the table
   * @returns {Promise} A promise containing the resource
   */
  scan(key, value) {
    const params = {
      TableName: this.table,
      FilterExpression: `${key} = :value`,
      ExpressionAttributeValues: {
        ':value': value,
      },
    };
    return this.client.scan(params).promise();
  }


  /**
   * Delete the table entry for a resource
   * @param {string} primaryKey The DynamoDB key for the resource
   * @returns {Promise} An empty promise
   */
  delete(primaryKey) {
    if (this.table === null || this.primaryKey === null) {
      throw new NullTableException();
    }

    return this.client.delete({
      TableName: this.table,
      Key: { [this.primaryKey]: primaryKey },
    }).promise();
  }
}

/**
 * A module for wrapping DynamoDB tables in a Promise-based CRUD interface
 * @module NosQL
 */
module.exports = NosQL;
