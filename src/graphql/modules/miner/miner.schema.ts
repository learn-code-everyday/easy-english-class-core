import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllMiner(q: QueryGetListInput): MinerPageData
    getOneMiner(id: ID!): Miner
    # Add Query
    getDataMinerForAdmin: DataMinerForAdmin
  }

  extend type Mutation {
    scanMiner(data: ScanMinerInput!): Miner
    connectMiner(data: ConnectMinerInput!): Miner
    disConnectMiner(data: DisConnectMinerInput!): Miner
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
    emission: Emission
  }

  type MinerPageData {
    data: [Miner]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
