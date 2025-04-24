import { gql } from "apollo-server-express";

const schema = gql`
  extend type Query {
    getAllProduct(q: QueryGetListInput): ProductPageData
    getOneProduct(id: ID!): Product
    # Add Query
  }

  extend type Mutation {
    createProduct(data: CreateProductInput!): Product
    updateProduct(id: ID!, data: UpdateProductInput!): Product
    deleteOneProduct(id: ID!): Product
    # Add Mutation
  }

  input DescriptionInput {
    price: Float
    discountPrice: Float
    discount: Float
    subscription: String
    poweredBy: String
    shippingTime: String
    returnPolicy: String
  }

  input ActionInput {
    icon: String
    title: String
    description: String
  }

  input FutureInput {
    href: String
    title: String
    description: String
  }

  input AllInOneInput {
    icon: String
    title: String
    description: String
  }

  input TechSpecsInfoInput {
    categories: String
    description: String
  }

  input TechSpecsInput {
    icon: String
    info: TechSpecsInfoInput
  }

  input CreateProductInput {
    name: String
    status: String
    language: String
    description: DescriptionInput
    action: [ActionInput]
    future: [FutureInput]
    allInOne: [AllInOneInput]
    techSpecs: TechSpecsInput
  }

  input UpdateProductInput {
    name: String
    status: String
    language: String
    description: DescriptionInput
    action: [ActionInput]
    future: [FutureInput]
    allInOne: [AllInOneInput]
    techSpecs: TechSpecsInput
  }

  type Description {
    price: Float
    subscription: String
    poweredBy: String
    shippingTime: String
    returnPolicy: String
  }

  type Action {
    icon: String
    title: String
    description: String
  }

  type Future {
    href: String
    title: String
    description: String
  }

  type AllInOne {
    icon: String
    title: String
    description: String
  }

  type TechSpecs {
    icon: String
    info: TechSpecsInfo
  }

  type TechSpecsInfo {
    categories: String
    description: String
  }

  type Product {
    id: String
    createdAt: DateTime
    updatedAt: DateTime

    name: String
    status: String
    language: String
    description: Description
    action: [Action]
    future: [Future]
    allInOne: [AllInOne]
    techSpecs: TechSpecs
  }

  type ProductPageData {
    data: [Product]
    total: Int
    pagination: Pagination
  }
`;

export default schema;
