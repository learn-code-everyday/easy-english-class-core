import {gql} from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllOrder(q: QueryGetListInput): OrderPageData
    getOrderForMerchant(q: QueryGetListInput): OrderForMerchant
    getOneOrder(id: ID!): Order
    # Add Query
  }

  extend type Mutation {
    createOrder(data: CreateOrderInput!): Order
    updateOrder(id: ID!, data: UpdateOrderInput!): Order
    updateOrderForAdmin(id: ID!, data: UpdateOrderInput!): Order
    deleteOneOrder(id: ID!): Order
    # Add Mutation
  }
  
  input CreateOrderInput {
    customerId: String
    fullname: String
    phone: String
    gmail: String
    address: String
    district: String
    ward: String
    city: String
    location: String
    currency: String
    paymentMethod: String
    qrNumber: [String]
    quantity: Float
    transactionImage: [String]
    transactionInput: String
  }

  input UpdateOrderInput {
    customerId: String
    fullname: String
    phone: String
    gmail: String
    address: String
    district: String
    ward: String
    city: String
    location: String
    currency: String
    paymentMethod: String
    qrNumber: [String]
    quantity: Float
    status: String
    trackingLink: String
    rejectReason: String
    transactionImage: [String]
    transactionInput: String
  }

  type Order {
    id: String    
    userId: String    
    customerId: String    
    createdAt: DateTime
    updatedAt: DateTime
    paymentDate: DateTime
    fullname: String
    currency: String
    phone: String
    gmail: String
    address: String
    district: String
    ward: String
    city: String
    location: String
    paymentMethod: String
    quantity: Float
    amount: Float
    status: String
    rejectReason: String
    trackingLink: String
    qrNumber: [String]
    transactionImage: [String]
    transactionInput: String
    customer: CustomerForOrder
    user: UserForOrder
  }
  
  type OrderForMerchant {
    totalUsdRevenue: Float
    totalUsdtRevenue: Float
    totalVndRevenue: Float
    totalCommission: Float
    totalOrder: Float
  }
  
  type UserForOrder {
      id: String
      gmail: String
      role: String
      name: String
      phone: String
      address: String
  }
  
  type CustomerForOrder {
    id: String
    firstname: String
    lastname: String
    phoneNumber: String
    address: String
    gmail: String
    referralCode: String
  }

  type OrderPageData {
    data: [Order]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
