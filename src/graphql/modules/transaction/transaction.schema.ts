import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllTransaction(q: QueryGetListInput): TransactionPageData
    getOneTransaction(id: ID!): Transaction
    # Add Query
  }

  extend type Mutation {
    createTransaction(data: CreateTransactionInput!): Transaction
    updateTransaction(id: ID!, data: UpdateTransactionInput!): Transaction
    deleteOneTransaction(id: ID!): Transaction
    # Add Mutation
  }

  input CreateTransactionInput {
    name: String
  }

  input UpdateTransactionInput {
    name: String
  }

  type Transaction {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type TransactionPageData {
    data: [Transaction]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
