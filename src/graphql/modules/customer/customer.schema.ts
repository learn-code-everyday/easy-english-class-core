import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
  getAllCustomer(q: QueryGetListInput): CustomerPageData
  getOneCustomer(id: ID!): Customer
  # Add Query
  customerGetMe: Customer
}

extend type Mutation {
  updateCustomer(id: ID!, data: UpdateCustomerInput!): Customer
  deleteOneCustomer(id: ID!): Customer
  # Mutation
  loginByGoogle(idToken: String!): CustomerLoginData
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

type CustomerLoginData {
  token: String
  customer: Customer
}

input UpdateCustomerInput {
  status: String
  approved: Boolean
}

type CustomerLoginData {
  customer: Customer
  token: String
}

type Customer {
  id: String
  createdAt: DateTime
  updatedAt: DateTime

  username: String
  activeAt: DateTime
  role: String
  avatarUrl: String
  displayName: String
  phoneNumber: String
  
  gender: String
  birthday: DateTime
  address: String

  district: String
  ward: String
  city: String

  slogan: String
  company: String
  club: String
  school: String
  bloodType: String
  citizenId: String
  gmail: String

  referralCode: String
  referrenceId: String

  status: String

}

type CustomerPageData {
  data: [Customer]
  total: Int
  pagination: Pagination
}
`;

export default schema;
