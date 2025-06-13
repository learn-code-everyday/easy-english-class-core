import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllCommissions(q: QueryGetListInput): CommissionsPageData
    getOneCommissions(id: ID!): Commissions
    # Add Query
  }

  extend type Mutation {
    createCommissions(data: CreateCommissionsInput!): Commissions
    updateCommissions(id: ID!, data: UpdateCommissionsInput!): Commissions
    deleteOneCommissions(id: ID!): Commissions
    # Add Mutation
  }

  input CreateCommissionsInput {
    orderId: String
    userId: String
    commission: Float
    status: String
    paymentDate: String
  }

  input UpdateCommissionsInput {
    orderId: String
    userId: String
    commission: Float
    status: String
    paymentDate: String
  }

  type Commissions {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    orderId: String
    userId: String
    commission: Float
    status: String
    paymentDate: DateTime
    order: OrderForCommission
    user: UserForCommission
  }
  
   type OrderForCommission {
    id: String
    fullname: String
    phone: String
    gmail: String
    address: String
    paymentMethod: String
    currency: String
    quantity: Float
    amount: Float
  }
  
  type UserForCommission {
      id: String
      gmail: String
      role: String
      name: String
      phone: String
      address: String
  }

  type CommissionsPageData {
    data: [Commissions]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
