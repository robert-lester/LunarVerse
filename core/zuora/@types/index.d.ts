interface ZuoraCalloutParameterNode {
  attributes: {
    name: string
  }
  elements: [
    {
      text: string
      type: 'text'
    }
  ]
  name: 'parameter'
  type: 'element'
}

export interface ZuoraCalloutRequest {
  declaration: {
    attributes: {
      encoding: 'UTF-8'
      version: '1.0'
    }
  }
  elements: [
    {
      elements: Array<ZuoraCalloutParameterNode>
      name: 'callout'
      type: 'element'
    }
  ]
}