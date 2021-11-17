import { stringify as stringifyJson } from 'flatted';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { parse } from 'json2csv';

import Utils from '../../utils';

import { ZuoraRESTSDKOptions, ZuoraUsageRow } from './@types/index';

// Zuora's REST API accepts a maximum of 50 records per upload batch
// Because the SOAP client (Import object) requires the MTOM protocol
// (which none of the available SDKs support), we must instead batch into multiple requests
const USAGE_ROW_LIMIT = 50;
const chunkUsageRows = Utils.getArrayChunker(USAGE_ROW_LIMIT);

class ZuoraRESTSDK {
  public constructor(private options: ZuoraRESTSDKOptions) {}

  public get Usage() {
    return {
      create: (usageRows: Array<ZuoraUsageRow>) => Promise.all(
        chunkUsageRows(usageRows)
          // For each chunk of 50 Usage rows, make the API call
          .map((usageRows: Array<ZuoraUsageRow>, idx) => new Promise((resolve, reject) => {
            const form = new FormData();

            // This is an ugly workaround. In order to encode the multipart
            // "file" binary properly, we need to attach a ReadableStream.
            // The easiest way to do so is to write a temporary file and attach
            // a stream to it.
            const handle = `/tmp/usage.${idx}.csv`;
            fs.writeFileSync(handle, parse(usageRows));
            form.append('file', fs.createReadStream(handle));

            form.submit({
              headers: {
                apiaccesskeyid: this.options.username,
                apisecretaccesskey: this.options.password,
              },
              host: `rest.${this.options.sandbox ? 'apisandbox.' : ''}zuora.com`,
              path: '/v1/usage',
              protocol: 'https:',
            }, (err, res) => {
              // Now that we've received a response, we can discard the file
              fs.unlinkSync(handle);
              let body = '';

              if (err) {
                reject(err);
              } else if (res.statusCode > 399) {
                // We can't use JSON.stringify here because the response can be circular
                reject(new Error(stringifyJson(res)));
              }
              res.on('data', (chunk) => {
                body += chunk;
              })
                .on('error', (err) => {
                  reject(err);
                })
                .on('end', () => {
                  resolve(JSON.parse(body));
                });
            })
              .on('error', (err) => {
                // Discard the file
                fs.unlinkSync(handle);
                reject(err);
              });
          })),
      ),
    };
  };
}

export {
  ZuoraRESTSDK,
  ZuoraRESTSDKOptions,
  ZuoraUsageRow,
};