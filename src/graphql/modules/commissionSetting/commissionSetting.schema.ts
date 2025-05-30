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
    isDefault: Boolean
    percentage: Float
    maxAmount: Float
    minAmount: Float
    effectiveFrom: DateTime
    effectiveTo: DateTime
    status: String
  }

  input UpdateCommissionSettingInput {
    isDefault: Boolean
    percentage: Float
    maxAmount: Float
    minAmount: Float
    effectiveFrom: DateTime
    effectiveTo: DateTime
    status: String
  }

  type CommissionSetting {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime
    
    isDefault: Boolean
    percentage: Float
    maxAmount: Float
    minAmount: Float
    effectiveFrom: DateTime
    effectiveTo: DateTime
    status: String
  }

  type CommissionSettingPageData {
    data: [CommissionSetting]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
