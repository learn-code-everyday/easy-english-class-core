import { gql } from "apollo-server-express";
import { UserRoles } from "./user.model";

const schema = gql`
extend type Query {
  getAllUser(q: QueryGetListInput): UserPageData
  getOneUser(id: ID!): User
  # Add Query
  userGetMe: User
  getUsersByRole(role: String!, q: QueryGetListInput): UserPageData
}

extend type Mutation {
  createUser(data: CreateUserInput!): User
  updateUser(id: ID!, data: UpdateUserInput!): User
  updateUserMyProfile(data: UpdateUserInput!): User
  deleteOneUser(id: ID!): User
    # Add Mutation
  signInUserByEmail(gmail: String!): UserLoginData
  updatePassword(currentPassword: String, newPassword: String!): User
}

type UserLoginData {
  user: User
  token: String
}

input PaymentInfoInput {
  bankName: String
  accountBankName: String
  bankNumber: String
  walletAddress: String
}

type PaymentInfo {
  bankName: String
  accountBankName: String
  bankNumber: String
  walletAddress: String
}

input CreateUserInput {
  name: String
  gmail: String
  password: String
  phone: String
  address: String
  walletAddress: String
  avatar: String
  role: String
  referralCode: String
  payment: PaymentInfoInput
}

input UpdateUserInput {
  name: String
  gmail: String
  password: String
  phone: String
  address: String
  walletAddress: String
  avatar: String
  role: String
  status: String
  referralCode: String
  payment: PaymentInfoInput
}

input UserUpdateMeInput {
  name: String
  phone: String
  address: String
  avatar: String
  provinceId: String
  districtId: String
  wardId: String
  """${Object.values(UserRoles).join("|")}"""
  role: String
}

type User {
  id: String
  gmail: String
  referralCode: String
  referrenceId: String
  role: String
  name: String
  phone: String
  address: String
  payment: PaymentInfo
  lastLoginAt: DateTime
  activeAt: DateTime
  status: String
  isFirstLogin: Boolean
  infoReferrence: InfoReferrence

  createdAt: DateTime
  updatedAt: DateTime
}

type InfoReferrence {
  id: String
  gmail: String
  name: String
  phone: String
}


type UserPageData {
  data: [User]
  total: Int
  pagination: Pagination
}
`;

export default schema;
