import { gql } from 'apollo-server-express';

const schema = gql`
    extend type Query {
        getAllMedia(q: QueryGetListInput): MediaPageData
        getOneMedia(id: NonEmptyString!): Media
        # Add Query
    }

    extend type Mutation {
        createMedia(data: CreateMediaInput!): Media
        updateMedia(id: NonEmptyString!, data: UpdateMediaInput!): Media
        deleteOneMedia(id: NonEmptyString!): Media
        uploadImage(file: Upload!): Media
        # Add Mutation
    }

    input CreateMediaInput {
        name: String
    }

    input UpdateMediaInput {
        name: String
    }

    type Media {
        id: String
        createdAt: DateTime
        updatedAt: DateTime
        url: String

        name: String
        status: String
    }

    type MediaPageData {
        data: [Media]
        total: Int
        pagination: Pagination
    }
`;

export default schema;
