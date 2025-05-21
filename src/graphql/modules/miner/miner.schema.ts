import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllMiner(q: QueryGetListInput): MinerPageData
    getOneMiner(id: ID!): Miner
    # Add Query
  }

  extend type Mutation {
    scanMiner(data: ScanMinerInput!): Miner
    createMiner(data: CreateMinerInput!): Miner
    updateMiner(id: ID!, data: UpdateMinerInput!): Miner
    deleteOneMiner(id: ID!): Miner
    # Add Mutation
  }
  
  input ScanMinerInput {
    code: String
  }

  input CreateMinerInput {
    name: String
    code: String
    blockChainAddress: String
    customerId: ID
    status: String
    registered: Boolean
    totalTokensMined: Float
    totalUptime: Float
    currentHashRate: Float
    lastActive: DateTime
  }

  input UpdateMinerInput {
    name: String
    code: String
    blockChainAddress: String
    customerId: ID
    status: String
    registered: Boolean
    totalTokensMined: Float
    totalUptime: Float
    currentHashRate: Float
    lastActive: DateTime
  }

  type Miner {
    id: ID
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    code: String
    blockChainAddress: String
    customerId: ID
    status: String
    registered: Boolean
    totalTokensMined: Float
    totalUptime: Float
    currentHashRate: Float
    lastActive: DateTime
  }

  type MinerPageData {
    data: [Miner]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
