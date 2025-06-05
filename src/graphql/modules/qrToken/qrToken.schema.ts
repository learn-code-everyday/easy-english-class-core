import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllQrToken(q: QueryGetListInput): QrTokenPageData
    getOneQrToken(id: ID!): QrToken
    verifyQrToken(qrNumber: String!): QrToken
    # Add Query
  }

  extend type Mutation {
    generateMultipleQrCodes(quantity: Int): QrTokenPageData
    createQrToken(data: CreateQrTokenInput!): QrToken
    updateQrToken(id: ID!, data: UpdateQrTokenInput!): QrToken
    deleteOneQrToken(id: ID!): QrToken
    # Add Mutation
  }

  input CreateQrTokenInput {
    qrNumber: String
    token: String
    minerId: String
    customerId: String
    isExport: Boolean
    status: String
  }

  input UpdateQrTokenInput {
    qrNumber: String
    token: String
    minerId: String
    customerId: String
    isExport: Boolean
    status: String
  }
  
  type QrToken {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    qrNumber: String
    token: String
    minerId: String
    customerId: String
    isExport: Boolean
    status: String
    qrCodeUrl: String
    customer: Customer
    miner: Miner
  }

  type QrTokenPageData {
    data: [QrToken]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
