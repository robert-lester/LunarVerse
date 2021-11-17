<a name="module_lambda++"></a>

## lambda++
A module containing utilities for AWS Lambda


* [lambda++](#module_lambda++)
    * [.lambdaResponse](#module_lambda++.lambdaResponse) ⇒ <code>object</code>
    * [.handleErrors(error, callback)](#module_lambda++.handleErrors)
    * [.parseBody(body)](#module_lambda++.parseBody) ⇒ <code>object</code>

<a name="module_lambda++.lambdaResponse"></a>

### lambda++.lambdaResponse ⇒ <code>object</code>
Convert data into a response format compatible with Lambda HTTP bindings

**Kind**: static property of [<code>lambda++</code>](#module_lambda++)  
**Returns**: <code>object</code> - A map containing the properly formatted HTTP response  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data |  |  | Data returned by an API's business logic controllers |
| [statusCode] | <code>number</code> | <code>200</code> | The HTTP status that should be returned |
| [headers] | <code>object</code> | <code>{}</code> | A map of headers to add to the response |

<a name="module_lambda++.handleErrors"></a>

### lambda++.handleErrors(error, callback)
Convert API errors to a format compatible with Lambda HTTP bindings or CloudWatch logs

**Kind**: static method of [<code>lambda++</code>](#module_lambda++)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | A default JavaScript error, or a compatible custom exception object |
| callback | <code>function</code> | The callback for the Lambda function |

<a name="module_lambda++.parseBody"></a>

### lambda++.parseBody(body) ⇒ <code>object</code>
Transform a querystring into a map

**Kind**: static method of [<code>lambda++</code>](#module_lambda++)  
**Returns**: <code>object</code> - The parsed body  

| Param | Type | Description |
| --- | --- | --- |
| body | <code>string</code> | The "event.body" passed to a Lambda |

&copy; 2017 Launch That, LLC