import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllNotificationUser(q: QueryGetListInput): NotificationUserPageData
    getOneNotificationUser(id: ID!): NotificationUser
    # Add Query
  }

  extend type Mutation {
    createNotificationUser(data: CreateNotificationUserInput!): NotificationUser
    updateNotificationUser(id: ID!, data: UpdateNotificationUserInput!): NotificationUser
    deleteOneNotificationUser(id: ID!): NotificationUser
    # Add Mutation
  }

  input CreateNotificationUserInput {
    title: String
    description: String
    userId: String
    isRead: Boolean
  }

  input UpdateNotificationUserInput {
    title: String
    description: String
    userId: String
    isRead: Boolean
  }

  type NotificationUser {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    title: String
    description: String
    status: String
    isRead: Boolean
  }

  type NotificationUserPageData {
    data: [NotificationUser]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
