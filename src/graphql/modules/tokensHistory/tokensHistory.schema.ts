import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllTokensHistory(q: QueryGetListInput): TokensHistoryPageData
    getOneTokensHistory(id: ID!): TokensHistory
    # Add Query
  }

  extend type Mutation {
    createTokensHistory(data: CreateTokensHistoryInput!): TokensHistory
    updateTokensHistory(id: ID!, data: UpdateTokensHistoryInput!): TokensHistory
    deleteOneTokensHistory(id: ID!): TokensHistory
    # Add Mutation
  }

  input CreateTokensHistoryInput {
    minerId: String
    tokenAmount: Float
    transactionId: String
  }

  input UpdateTokensHistoryInput {
    minerId: String
    tokenAmount: Float
    transactionId: String
  }

  type TokensHistory {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    minerId: String
    tokenAmount: Float
    transactionId: String
  }

  type TokensHistoryPageData {
    data: [TokensHistory]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
