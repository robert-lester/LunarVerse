export default /* GraphQL */ `
  interface Node {
    id               : Int!
    # Organization identifier
    organization_id  : ID!
    created_at       : Date
    updated_at       : Date
  }
`;
