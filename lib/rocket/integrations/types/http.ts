import axios, { AxiosRequestConfig } from 'axios';
import * as querystring from 'querystring';
import * as XML from 'js2xmlparser';
import { BaseRocket } from '../baseRocket';
import RocketResponse from './rocketResponse';

export class HttpRocket extends BaseRocket {
  constructor(type: string, config: any) {
    super(type, config);
    this.config.url = config.postingURL;
  }

  /**
   * Calls the correct function based on the dataType
   * @param {object} data contains the mapped data
   * @returns {Promise} function to send POST Request
   */
  async send(data: any) {
    const method = 'POST';
    const { dataType } = data;

    if (dataType === 'form') {
      return this.sendForm(data, method);
    } else if (dataType === 'json') {
      return this.sendJSON(data, method);
    } else if (dataType === 'xml') {
      return this.sendXML(data, method);
    }
  }

  /**
   * Sends the POST Request through axios if dataType is 'form'
   * @param {object} data contains mapped data to send
   * @param {string} method POST method for axios
   * @returns {Promise} function to build the response
   */
  async sendForm(data: any, method: string) {
    const { url, httpAuthEnabled, httpAuthUser, httpAuthPassword } = this.config;
    // Build axios request config so auth can be added
    // if auth exists in the config
    const axiosRequest: AxiosRequestConfig = {
      method,
      data: querystring.stringify(data.map),
      url: url,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (httpAuthEnabled) {
      axiosRequest.auth = {
        username: httpAuthUser,
        password: httpAuthPassword,
      };
    };

    const res = await axios(axiosRequest);

    return this.buildResponse(res);
  }

  /**
   * Sends the POST Request through axios if dataType is 'json'
   * @param {object} data contains mapped data to send
   * @param {string} method POST method for axios
   * @returns {Promise} function to build the response
   */
  async sendJSON(data: any, method: string) {
    const { url, httpAuthEnabled, httpAuthUser, httpAuthPassword } = this.config;
    // Build axios request config so auth can be added
    // if auth exists in the config
    const axiosRequest: AxiosRequestConfig = {
      method,
      data: data.map,
      url: url,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (httpAuthEnabled) {
      axiosRequest.auth = {
        username: httpAuthUser,
        password: httpAuthPassword,
      };
    }

    const res = await axios(axiosRequest);

    return this.buildResponse(res);
  }

  /**
   * Sends the POST Request through axios if dataType is 'xml'
   * @param {object} data contains mapped data to send
   * @param {string} method POST method for axios
   * @returns {Promise} function to build the response
   */
  async sendXML(data: any, method: string) {
    const { url, httpAuthEnabled, httpAuthUser, httpAuthPassword } = this.config;
    // Build axios request config so auth can be added
    // if auth exists in the config
    const axiosRequest: AxiosRequestConfig = {
      method,
      data: XML.parse('Lead', data),
      url: url,
      validateStatus: () => true,
      headers: {
        'Content-Type': 'text/xml',
      },
    };

    if (httpAuthEnabled) {
      axiosRequest.auth = {
        username: httpAuthUser,
        password: httpAuthPassword,
      };
    }

    const res = await axios(axiosRequest);

    return this.buildResponse(res);
  }

  /**
   * builds response based on the status code
   * @param {object} res contains the response from the POST Request
   * @returns {object} built out response
   */
  buildResponse(res: any) {
    this.config.response = {
      status: res.status,
      raw: {
        status: res.status,
        statusText: res.statusText,
        response: res.data !== null && typeof res.data === 'object' ?
          JSON.stringify(res.data, null, 2) : res.data.toString(),
        message: 'Message sent successfully',
      }
    }

    return this.config.response;
  }
}