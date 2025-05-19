import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllMinerErrorLogs(q: QueryGetListInput): MinerErrorLogsPageData
    getOneMinerErrorLogs(id: ID!): MinerErrorLogs
    # Add Query
  }

  extend type Mutation {
    createMinerErrorLogs(data: CreateMinerErrorLogsInput!): MinerErrorLogs
    updateMinerErrorLogs(id: ID!, data: UpdateMinerErrorLogsInput!): MinerErrorLogs
    deleteOneMinerErrorLogs(id: ID!): MinerErrorLogs
    # Add Mutation
  }

  input CreateMinerErrorLogsInput {
    name: String
  }

  input UpdateMinerErrorLogsInput {
    name: String
  }

  type MinerErrorLogs {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type MinerErrorLogsPageData {
    data: [MinerErrorLogs]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
