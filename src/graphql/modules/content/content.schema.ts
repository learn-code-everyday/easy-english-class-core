import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllContent(q: QueryGetListInput): ContentPageData
    getOneContent(id: ID!): Content
    # Add Query
  }

  extend type Mutation {
    createContent(data: CreateContentInput!): Content
    updateContent(id: ID!, data: UpdateContentInput!): Content
    deleteOneContent(id: ID!): Content
    # Add Mutation
  }

  input CreateContentInput {
    key: String
    value: String
    language: String
    isActive: Boolean
    status: String
  }

  input UpdateContentInput {
    key: String
    value: String
    language: String
    isActive: Boolean
    status: String
  }

  type Content {
    id: String    
    createdAt: DateTime
    updatedAt: DateTime

    value: String
    language: String
    key: String
    isActive: Boolean
    status: String
  }

  type ContentPageData {
    data: [Content]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
