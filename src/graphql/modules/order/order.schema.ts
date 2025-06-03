import {gql} from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllOrder(q: QueryGetListInput): OrderPageData
    getOneOrder(id: ID!): Order
    # Add Query
  }

  extend type Mutation {
    createOrder(data: CreateOrderInput!): Order
    updateOrder(id: ID!, data: UpdateOrderInput!): Order
    deleteOneOrder(id: ID!): Order
    # Add Mutation
  }
  
  input CreateOrderInput {
    customerId: String
    fullname: String
    phone: String
    gmail: String
    address: String
    paymentMethod: String
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
    paymentMethod: String
    quantity: Float
    status: String
    transactionImage: [String]
    transactionInput: String
  }

  type Order {
    id: String    
    userId: String    
    customerId: String    
    createdAt: DateTime
    updatedAt: DateTime
    fullname: String
    phone: String
    gmail: String
    address: String
    paymentMethod: String
    quantity: Float
    amount: Float
    status: String
    rejectReason: String
    listQrUrl: [String]
    transactionImage: [String]
    transactionInput: String
    customer: CustomerForOrder
    user: UserForOrder
  }
  
  type UserForOrder {
      id: String
      email: String
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
