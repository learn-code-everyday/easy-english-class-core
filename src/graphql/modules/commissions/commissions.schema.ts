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
    name: String
  }

  input UpdateCommissionsInput {
    name: String
  }

  type Commissions {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type CommissionsPageData {
    data: [Commissions]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
