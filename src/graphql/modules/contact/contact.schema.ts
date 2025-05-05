import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllContact(q: QueryGetListInput): ContactPageData
    getOneContact(id: ID!): Contact
    # Add Query
  }

  extend type Mutation {
    createContact(data: CreateContactInput!): Contact
    updateContact(id: ID!, data: UpdateContactInput!): Contact
    deleteOneContact(id: ID!): Contact
    # Add Mutation
  }

  input CreateContactInput {
    name: String!
    phone: String
    email: String
    notice: String!
  }

  input UpdateContactInput {
    name: String
    phone: String
    email: String
    notice: String
  }

  type Contact {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    phone: String
    email: String
    notice: String
    status: String
  }

  type ContactPageData {
    data: [Contact]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
