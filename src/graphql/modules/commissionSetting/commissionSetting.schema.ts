import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllCommissionSetting(q: QueryGetListInput): CommissionSettingPageData
    getOneCommissionSetting(id: ID!): CommissionSetting
    # Add Query
  }

  extend type Mutation {
    createCommissionSetting(data: CreateCommissionSettingInput!): CommissionSetting
    updateCommissionSetting(id: ID!, data: UpdateCommissionSettingInput!): CommissionSetting
    deleteOneCommissionSetting(id: ID!): CommissionSetting
    # Add Mutation
  }

  input CreateCommissionSettingInput {
    name: String
  }

  input UpdateCommissionSettingInput {
    name: String
  }

  type CommissionSetting {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type CommissionSettingPageData {
    data: [CommissionSetting]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
