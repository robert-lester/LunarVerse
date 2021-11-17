export default /* GraphQL */ `
    enum UserType {
        CONTACT
        USER
    }
    input UpdateableUserFields {
        id                  : Int
        name                : String
        physicalNumber      : String
        # TODO: Remove directDialNumber after it's been removed from the frontend
        directDialNumber    : String
        phoneNumber        : Int
    }
    # A external user object
    type User implements Node {
        id                      : Int!
        # Users physical phone number
        physicalNumber          : PhoneString!
        # Organization identifier
        organization_id         : ID!
        # Type of User
        type                    : UserType!
        created_at              : Date
        updated_at              : Date
        # TODO: Remove directDialNumber after it's been removed from the frontend
        directDialNumber        : PhoneString
        # Name of the user
        name                    : String
        # Whether the user has been assigned a number
        assigned            : Boolean
        # Background color of the user
        color                : String
        # Assigned phone number
        phoneNumber            : PhoneNumber
    }
   type Activity {
       id                       : Int
       isUser                   : Boolean
       firstInBound             : Date
       firstOutBound            : Date
       lastInBound              : Date
       lastOutBound             : Date
       status                   : Boolean
       systemNumber             : PhoneString
       physicalNumber           : PhoneString
   }

   type CrmUser {
       external_number          : PhoneString!
       internal_number          : PhoneString!
       name                     : String
   }

   extend type Query {
        # Get a single user by ID
        getUser(id: Int)        : User!
        # Get a singel user by physical number
        getUserByPhysicalPhone(
            phoneNumber         : String
        )                       : User!
        # Get all users
        getUsers (
            type: UserType,
            assigned: Boolean
        )                : [User]
        # Get Contact activity
        getActivity(
            phoneNumber         : String
        )                       : Activity
    }
   extend type Mutation {
       # Creates a new system user
        createUser(
            physicalNumber      : String
            name                : String
        )                       : User!
        # Creates a new external user
        createContact(
            userRealNumber       : String
            contactRealNumber    : String
            name                : String
        )                       : PhoneNumber!
        # Updates a single user record
        updateUser(
            args                : UpdateableUserFields

        )                       : User!
        # Updates multiple users
        updateUsers(
            args                : [UpdateableUserFields]
        )                       : [User]!
        deleteUser(id: Int)     : Boolean
    }
`;
