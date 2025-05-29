import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllQrToken(q: QueryGetListInput): QrTokenPageData
    getOneQrToken(id: ID!): QrToken
    # Add Query
  }

  extend type Mutation {
    createQrToken(data: CreateQrTokenInput!): QrToken
    updateQrToken(id: ID!, data: UpdateQrTokenInput!): QrToken
    deleteOneQrToken(id: ID!): QrToken
    # Add Mutation
  }

  input CreateQrTokenInput {
    name: String
  }

  input UpdateQrTokenInput {
    name: String
  }

  type QrToken {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type QrTokenPageData {
    data: [QrToken]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
