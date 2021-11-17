<a name="module_DynamoCRUD"></a>

## NosQL
Make using DynamoDB fast 🏎


* [DynamoCRUD](#module_DynamoCRUD)
    * [DynamoCRUD](#exp_module_DynamoCRUD--DynamoCRUD) ⏏
        * [new DynamoCRUD(client, tableName)](#new_module_DynamoCRUD--DynamoCRUD_new)
        * [.index()](#module_DynamoCRUD--DynamoCRUD+index) ⇒ <code>Promise</code>
        * [.create(id, attributes, options)](#module_DynamoCRUD--DynamoCRUD+create) ⇒ <code>Promise</code>
        * [.read(id)](#module_DynamoCRUD--DynamoCRUD+read) ⇒ <code>Promise</code>
        * [.update(id, attributes, options)](#module_DynamoCRUD--DynamoCRUD+update) ⇒ <code>Promise</code>
        * [.delete(id)](#module_DynamoCRUD--DynamoCRUD+delete) ⇒ <code>Promise</code>

<a name="exp_module_DynamoCRUD--DynamoCRUD"></a>

### DynamoCRUD ⏏
Wrap a DynamoDB table in a Promise-based CRUD interface

**Kind**: Exported class  
<a name="new_module_DynamoCRUD--DynamoCRUD_new"></a>

#### new DynamoCRUD(client, tableName)
Initialize a new instance of the DynamoCRUD API


| Param | Type | Description |
| --- | --- | --- |
| client | <code>object</code> | A DynamoDB DocumentClient to use as the agent for accessing DynamoDB |
| tableName | <code>object</code> | The name of the table this API should operate on |

<a name="module_DynamoCRUD--DynamoCRUD+index"></a>

#### dynamoCRUD.index() ⇒ <code>Promise</code>
Retrieve all resources from a table

**Kind**: instance method of [<code>DynamoCRUD</code>](#exp_module_DynamoCRUD--DynamoCRUD)  
**Returns**: <code>Promise</code> - A promise containing an array of resources  
<a name="module_DynamoCRUD--DynamoCRUD+create"></a>

#### dynamoCRUD.create(id, attributes, options) ⇒ <code>Promise</code>
Create a new resource in the table

**Kind**: instance method of [<code>DynamoCRUD</code>](#exp_module_DynamoCRUD--DynamoCRUD)  
**Returns**: <code>Promise</code> - A promise containing the fields of the new resource  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The DynamoDB hashkey that should be used |
| attributes | <code>object</code> |  | A map of attributes to add to the new resource |
| options | <code>object</code> |  | A map of options for the create operation |
| [options.timestamps] | <code>boolean</code> | <code>true</code> | Include UNIX timestamps in the new resource |

<a name="module_DynamoCRUD--DynamoCRUD+read"></a>

#### dynamoCRUD.read(id) ⇒ <code>Promise</code>
Get the table entry for a resource

**Kind**: instance method of [<code>DynamoCRUD</code>](#exp_module_DynamoCRUD--DynamoCRUD)  
**Returns**: <code>Promise</code> - A promise containing the resource  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The DynamoDB hashkey for the resource |

<a name="module_DynamoCRUD--DynamoCRUD+update"></a>

#### dynamoCRUD.update(id, attributes, options) ⇒ <code>Promise</code>
Update the table entry for a resource

**Kind**: instance method of [<code>DynamoCRUD</code>](#exp_module_DynamoCRUD--DynamoCRUD)  
**Returns**: <code>Promise</code> - A promise containing the resource  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| id | <code>string</code> |  | The DynamoDB hashkey that should be used |
| attributes | <code>object</code> |  | A map of attributes to update on the resource |
| options | <code>object</code> |  | A map of options for the create operation |
| [options.timestamps] | <code>boolean</code> | <code>true</code> | Update the UNIX timestamps on the resource |

<a name="module_DynamoCRUD--DynamoCRUD+delete"></a>

#### dynamoCRUD.delete(id) ⇒ <code>Promise</code>
Delete the table entry for a resource

**Kind**: instance method of [<code>DynamoCRUD</code>](#exp_module_DynamoCRUD--DynamoCRUD)  
**Returns**: <code>Promise</code> - An empty promise  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The DynamoDB hashkey for the resource |

&copy; 2017 Launch That, LLC