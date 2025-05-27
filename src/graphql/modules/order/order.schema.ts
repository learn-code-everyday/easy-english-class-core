import { gql } from "apollo-server-express";

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
    name: String
  }

  input UpdateOrderInput {
    name: String
  }

  type Order {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
  }

  type OrderPageData {
    data: [Order]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
