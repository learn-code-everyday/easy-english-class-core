import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllCommissions(q: QueryGetListInput): CommissionsPageData
    getOneCommissions(id: ID!): Commissions
    # Add Query
  }

  extend type Mutation {
    createCommissions(data: CreateCommissionsInput!): Commissions
    updateCommissions(id: ID!, data: UpdateCommissionsInput!): Commissions
    deleteOneCommissions(id: ID!): Commissions
    # Add Mutation
  }

  input CreateCommissionsInput {
    orderId: String
    buyerId: String
    commission: Float
    status: String
    paymentDate: String
  }

  input UpdateCommissionsInput {
    orderId: String
    buyerId: String
    commission: Float
    status: String
    paymentDate: String
  }

  type Commissions {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    orderId: String
    buyerId: String
    commission: Float
    status: String
    paymentDate: String
  }

  type CommissionsPageData {
    data: [Commissions]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
