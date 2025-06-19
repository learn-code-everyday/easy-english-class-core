import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
  getAllCustomer(q: QueryGetListInput): CustomerPageData
  getOneCustomer(id: ID!): Customer
  getCustomerForAdmin(data: GetCustomerForAdminInput): Customer
  # Add Query
  customerGetMe: Customer
}

extend type Mutation {
  updateCustomer(id: ID!, data: UpdateCustomerInput!): Customer
  updateMyProfile(data: UpdateCustomerInput!): Customer
  deleteOneCustomer(id: ID!): Customer
  # Mutation
}

type CountRef {
  numberRef: Int
}

type EmailAccessLink {
  href: String
}

type SummaryReferralAmountData {
  amount: Float
}

input GetCustomerForAdminInput {
  gmail: String
  referralCode: String
}

input UpdateCustomerInput {
  firstname: String
  lastname: String
  phoneNumber: String
  address: String
  district: String
  ward: String
  city: String
  location: String
  referralCode: String
}

type Customer {
  id: String
  createdAt: DateTime
  updatedAt: DateTime

  firstname: String
  lastname: String
  activeAt: DateTime
  role: String
  avatarUrl: String
  phoneNumber: String
  address: String

  district: String
  ward: String
  city: String
  location: String

  gmail: String
  referralCode: String
  referrenceId: String
  totalMiners: Float
  totalTokensMined: Float
  totalUptime: Float
  totalEmission: Float

  status: String
}

type CustomerPageData {
  data: [Customer]
  total: Int
  pagination: Pagination
}
`;

export default schema;
