import { GraphQLError, GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { parsePhoneNumber, formatPhoneNumber } from '../../lib/phoneParse';

const validateValue = (value: any) => {
  if (isNaN(Date.parse(value))) {
    throw new GraphQLError(`Query error not a valid date`, [value]);
  }
};

const GraphQLDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Scalar `Date` to represent datetime values',
  /**
   * Serialize date value into string
   * @param value Date value
   */
  serialize: (value: Date) => new Date(value).toUTCString(),
  /**
   * Parse value into datetime
   * @param value Serialized date value
   */
  parseValue: (value: string) => {
    validateValue(value);
    return new Date(value).getTime();
  },
  parseLiteral: (ast: any) => {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Query error: Can only parse dates strings, got a: ${ast.kind}`, [
        ast,
      ]);
    }
    validateValue(ast.value);
    return new Date(ast.value).getTime();
  },
});

const GraphQLPhoneNumber = new GraphQLScalarType({
  name: 'PhoneString',
  description: 'Scalar `PhoneString` to represent formatted string data',
  serialize: (value: string) => formatPhoneNumber(value),
  parseValue: (value: string) => {
    const phoneNumber = parsePhoneNumber(value);
    if (!phoneNumber) {
      throw new GraphQLError(`Query error: ${value} is not a valid phone number`);
    }
    return phoneNumber;
  },
  parseLiteral: (ast: any) => {
    if (ast.king !== Kind.STRING) {
      throw new GraphQLError(`Query error: Can only parse strings, got a ${ast.king}`, [ast]);
    }
    const phoneNumber = parsePhoneNumber(ast.value);
    if (!phoneNumber) {
      throw new GraphQLError(`Query error: ${ast.value} is not a valid phone number`);
    }
    return phoneNumber;
  },
});

const typeDefs = /* GraphQL */ `
# The \`Date\` scalar type represents datetime data
scalar Date
# The \`PhoneString\`scalar type represents formatted string data
scalar PhoneString
`;

const resolvers = {
  Date: GraphQLDate,
  PhoneString: GraphQLPhoneNumber,
};

export default {
  typeDefs,
  resolvers,
};
