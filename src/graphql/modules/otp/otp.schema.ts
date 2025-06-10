import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllOtp(q: QueryGetListInput): OtpPageData
    getOneOtp(id: ID!): Otp
    # Add Query
  }

  extend type Mutation {
    createOtp(data: CreateOtpInput!): Otp
    updateOtp(id: ID!, data: UpdateOtpInput!): Otp
    deleteOneOtp(id: ID!): Otp
    # Add Mutation
  }

  input CreateOtpInput {
    name: String
  }

  input UpdateOtpInput {
    name: String
  }

  type Otp {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type OtpPageData {
    data: [Otp]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
