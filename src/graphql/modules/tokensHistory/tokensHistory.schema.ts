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
    name: String
  }

  input UpdateTokensHistoryInput {
    name: String
  }

  type TokensHistory {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type TokensHistoryPageData {
    data: [TokensHistory]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
