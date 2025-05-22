import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllNotification(q: QueryGetListInput): NotificationPageData
    getOneNotification(id: ID!): Notification
    # Add Query
  }

  extend type Mutation {
    createNotification(data: CreateNotificationInput!): Notification
    updateNotification(id: ID!, data: UpdateNotificationInput!): Notification
    deleteOneNotification(id: ID!): Notification
    # Add Mutation
  }

  input CreateNotificationInput {
    title: String
    description: String
    customerId: String
  }

  input UpdateNotificationInput {
    title: String
    description: String
    customerId: String
  }

  type Notification {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    title: String
    description: String
    status: String
  }

  type NotificationPageData {
    data: [Notification]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
