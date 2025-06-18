import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getMyMiner(q: QueryGetListInput): MinerPageData
    getAllMiner(q: QueryGetListInput): MinerPageData
    getOneMiner(id: ID!): Miner
    # Add Query
    getDataMinerForAdmin: DataMinerForAdmin
  }

  extend type Mutation {
    scanMiner(data: ScanMinerInput!): Miner
    connectMiner(data: ConnectMinerInput!): Miner
    disConnectMiner(data: DisConnectMinerInput!): Miner
    createMiner(data: CreateMinerInput!): Miner
    updateMiner(id: ID!, data: UpdateMinerInput!): Miner
    deleteOneMiner(id: ID!): Miner
    # Add Mutation
  }
  
  input ScanMinerInput {
    code: String
  }
  
  input ConnectMinerInput {
    code: String
  }
  
  input DisConnectMinerInput {
    code: String
  }

  input CreateMinerInput {
    name: String
    model: String
    code: String
    status: String
    blockChainAddress: String
    currentHashRate: Float
    lastActive: DateTime
  }

  input UpdateMinerInput {
    name: String
    model: String
    code: String
    status: String
    blockChainAddress: String
    currentHashRate: Float
    lastActive: DateTime
  }
  
  type DataMinerForAdmin {
    totalMinersRegistered: Float
    totalMiners: Float
    activeMiners: Float
    totalTokensMined: Float
    totalBonsaiMined: Float
  }

  type Miner {
    id: ID
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    code: String
    blockChainAddress: String
    customerId: ID
    customer: Customer
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
