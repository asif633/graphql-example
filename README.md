# GraphQL with Nodejs #

## GraphQL Basic

### Query and Mutation

Query is for reading and Mutation is for writing data to underlying data source.

#### Query on fields

```
{
  hero {
    name
    # Queries can have comments!
    friends {
      name
    }
  }
}
```

##### Query using Arguments

Arguments can go to every level of query. Scalar arguments to transform data.

```
{
  human(id: "1000") {
    name
    height(unit: FOOT)
  }
}
```

##### Aliases

When we query same type using different arguments.

```
{
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}
```

##### Fragments

Purpose is to remove repetition. Best use case when mutiple UI components have same query fields but different arguments.

```
{
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

fragment comparisonFields on Character {
  name
  appearsIn
  friends {
    name
  }
}
```

##### Variables

Passing variables in arguments.

```
query HeroNameAndFriends($episode: Episode) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

and the variable pass, in applications the variable passing will be through code.

```
{
  "episode": "JEDI"
}
```

With `!` sign the variable becomes required. Default value pass `$episode: Episode = "JEDI"`.
Default value used with optional variable.

##### Directives

Directives are used to condition the query.

```
query Hero($episode: Episode, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    friends @include(if: $withFriends) {
      name
    }
  }
}
```

Two directives in main graphql `@include` and `@skip`.

#### Mutations

```
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

** Query fields can run in parallel but mutations run in series **

#### Inline Fragments

```
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
```

Here `Character` is an interface and `Droid` and `Human` are its types.

#### Meta fields

To get the typename or other meta info when query doesnot know about return.

```
{
  search(text: "an") {
    __typename
    ... on Human {
      name
    }
    ... on Droid {
      name
    }
    ... on Starship {
      name
    }
  }
}
```

### Schema

#### Object types and fields

```
type Character { // GraphQL Object
  name: String! // means 
  appearsIn: [Episode]! // Non Nullable, means will return something when queried.
}
```

#### Arguments on fields

```
type Starship {
  id: ID!
  name: String!
  length(unit: LengthUnit = METER): Float
}
```

#### Query and Mutation types

Query and Mutation types are also object types but they define the entry point of every graphql. Query is required, mutation is optional.

```
schema {
  query: Query
  mutation: Mutation
}
```

A sample query

```
query {
  hero {
    name
  }
  droid(id: "2000") {
    name
  }
}
```
the related object

```
type Query {
  hero(episode: Episode): Character
  droid(id: ID!): Droid
}
```

#### Scalar types

Scalar types are `Int`, `Float`, `String`, `Boolean`, `ID`

#### Enum types

```
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```

#### Lists and NonNull

```
type Character {
  name: String! // Non Null
  appearsIn: [Episode]! // List with Non Null of list
}
```

#### Interface

Character interface

```
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}
```

two object types

```
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}

type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}
```

to query

```
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
  }
}
```

#### Union Types

Union are same like interfaces but without any common fields.

```
union SearchResult = Human | Droid | Starship
```
Search

```
{
  search(text: "an") {
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
```

#### Input types

Input types can be created for complex arguments, useful in create, update mutation.

```
input ReviewInput {
  stars: Int!
  commentary: String
}
```

Example

```
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

My try for Email service

```
type Email{
    sender: EmailAccount!
    receiveDate: String!
    subject: String!
    body: String!
    receiver: EmailAccount!
}
type Inbox{
    emails: [Email]!
    unread: Int!
}
type EmailAccount{
    address: String!
    inbox: Inbox!
    drafts: [Email]!
    deleted: [Email]!
    sent: [Email]!
}
type User{
    name: String!
    emails: [EmailAccount]!
}
```

#### Pagination

Simple

```
{
  hero {
    name
    friends(first:2) {
      name
    }
  }
}
```

Different ways `friends(first:2 offset:2)`, `friends(first:2 after:$friendId)`, `friends(first:2 after:$friendCursor)`.

Complete

```
{
  hero {
    name
    friends(first:2) {
      totalCount
      edges {
        node {
          name
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
```

Another

```
{
  hero {
    name
    friendsConnection(first:2 after:"Y3Vyc29yMQ==") {
      totalCount
      edges {
        node {
          name
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
```

Express graphql

Import 
```
import graphqlHTTP from 'express-graphql'; // ES6
var graphqlHTTP = require('express-graphql'); // CommonJS
```

```
graphqlHTTP({
  schema: GraphQLSchema,
  graphiql?: ?boolean,
  rootValue?: ?any,
  context?: ?any,
  pretty?: ?boolean,
  formatError?: ?Function,
  validationRules?: ?Array<any>,
}): Middleware
```

Normal graphql

```
import { graphql } from 'graphql'; // ES6
var { graphql } = require('graphql'); // CommonJS
```

entry

```
graphql(
  schema: GraphQLSchema,
  requestString: string,
  rootValue?: ?any,
  contextValue?: ?any,
  variableValues?: ?{[key: string]: any},
  operationName?: ?string
): Promise<GraphQLResult>
```

Various types with code

** GraphQLSchema **

```
class GraphQLSchema {
  constructor(config: GraphQLSchemaConfig)
}

type GraphQLSchemaConfig = {
  query: GraphQLObjectType;
  mutation?: ?GraphQLObjectType;
}
```
** GraphQLScalarType **
config
```
type GraphQLScalarTypeConfig<InternalType> = {
  name: string;
  description?: ?string;
  serialize: (value: mixed) => ?InternalType;
  parseValue?: (value: mixed) => ?InternalType;
  parseLiteral?: (valueAST: Value) => ?InternalType;
}
```
use
```
var OddType = new GraphQLScalarType({
  name: 'Odd',
  serialize: oddValue,
  parseValue: oddValue,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return oddValue(parseInt(ast.value, 10));
    }
    return null;
  }
});

function oddValue(value) {
  return value % 2 === 1 ? value : null;
}
```

** GraphQLObjectType **
config
```
type GraphQLObjectTypeConfig = {
  name: string;
  interfaces?: GraphQLInterfacesThunk | Array<GraphQLInterfaceType>;
  fields: GraphQLFieldConfigMapThunk | GraphQLFieldConfigMap;
  isTypeOf?: (value: any, info?: GraphQLResolveInfo) => boolean;
  description?: ?string
}

type GraphQLFieldConfig = {
  type: GraphQLOutputType;
  args?: GraphQLFieldConfigArgumentMap;
  resolve?: GraphQLFieldResolveFn;
  deprecationReason?: string;
  description?: ?string;
}
```
use
```
var AddressType = new GraphQLObjectType({
  name: 'Address',
  fields: {
    street: { type: GraphQLString },
    number: { type: GraphQLInt },
    formatted: {
      type: GraphQLString,
      resolve(obj) {
        return obj.number + ' ' + obj.street
      }
    }
  }
});

var PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    name: { type: GraphQLString },
    bestFriend: { type: PersonType },
  })
});
```

** GraphQLInterfaceType **
config
```
type GraphQLInterfaceTypeConfig = {
  name: string,
  fields: GraphQLFieldConfigMapThunk | GraphQLFieldConfigMap,
  resolveType?: (value: any, info?: GraphQLResolveInfo) => ?GraphQLObjectType,
  description?: ?string
};
```
use
```
var EntityType = new GraphQLInterfaceType({
  name: 'Entity',
  fields: {
    name: { type: GraphQLString }
  }
});
```

** GraphQLUnionType **
config
```
type GraphQLUnionTypeConfig = {
  name: string,
  types: GraphQLObjectsThunk | Array<GraphQLObjectType>,
  resolveType?: (value: any, info?: GraphQLResolveInfo) => ?GraphQLObjectType;
  description?: ?string;
};
```
use
```
var PetType = new GraphQLUnionType({
  name: 'Pet',
  types: [ DogType, CatType ],
  resolveType(value) {
    if (value instanceof Dog) {
      return DogType;
    }
    if (value instanceof Cat) {
      return CatType;
    }
  }
});
```

** GraphQLEnumType **
config
```
type GraphQLEnumValueConfig = {
  value?: any;
  deprecationReason?: string;
  description?: ?string;
}
```
use
```
var RGBType = new GraphQLEnumType({
  name: 'RGB',
  values: {
    RED: { value: 0 },
    GREEN: { value: 1 },
    BLUE: { value: 2 }
  }
});
```
** GraphQLInputObjectType **
config
```
type GraphQLInputObjectConfig = {
  name: string;
  fields: GraphQLInputObjectConfigFieldMapThunk | GraphQLInputObjectConfigFieldMap;
  description?: ?string;
}
type GraphQLInputObjectField = {
  name: string;
  type: GraphQLInputType;
  defaultValue?: any;
  description?: ?string;
}
```
use
```
var GeoPoint = new GraphQLInputObjectType({
  name: 'GeoPoint',
  fields: {
    lat: { type: new GraphQLNonNull(GraphQLFloat) },
    lon: { type: new GraphQLNonNull(GraphQLFloat) },
    alt: { type: GraphQLFloat, defaultValue: 0 },
  }
});
```

** GraphQLList **
use
```
var PersonType = new GraphQLObjectType({
  name: 'Person',
  fields: () => ({
    parents: { type: new GraphQLList(Person) },
    children: { type: new GraphQLList(Person) },
  })
});
```
** GraphQLNonNull **
```
var RowType = new GraphQLObjectType({
  name: 'Row',
  fields: () => ({
    id: { type: new GraphQLNonNull(String) },
  })
});
```
** Predicates **
`function isInputType(type: ?GraphQLType): boolean`
`function isOutputType(type: ?GraphQLType): boolean`
`function isLeafType(type: ?GraphQLType): boolean`
`function isCompositeType(type: ?GraphQLType): boolean`
`function isAbstractType(type: ?GraphQLType): boolean`
** Un-modifiers **
`function getNullableType(type: ?GraphQLType): ?GraphQLNullableType`
`function getNamedType(type: ?GraphQLType): ?GraphQLNamedType`

** Scalars **
`GraphQLInt`
`GraphQLFloat`
`GraphQLString`
`GraphQLBoolean`
`GraphQLID`

Basic schema file for GraphQL
```
const graphql = require('graphql');
const _ = require('lodash');

const{
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLList,
    GraphQLInt,
    GraphQLSchema
} = graphql;

const users = [
    {id: '12', firstName: 'Asif', age: 32},
    {id: '13', firstName: 'Saif', age: 32}
];

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt }
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args){
                return _.find(users, { id: args.id }); 
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
})
```
Added json-server `npm install --save json-server`

```npm run json:server```

with `package.json` file change `"json:server": "json-server --watch db.json"`

Now graphQL starts to use json-server data.

Added nodemon `npm install --save nodemon`,

change in package.json `"dev": "nodemon server.js"`,

run by `npm run dev`

Relationships between types

Updated schema
```
const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull,
    GraphQLList,
    GraphQLInt,
    GraphQLSchema
} = graphql;

const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        desc: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                .then(res => res.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve: (parentValue, args) => {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data);
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(res => res.data);
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(res => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
})
```

Query can be done like
```
{
    company(id: "12"){
        name
        users{
            firstName
        }
    }
}
```

We can name queries
```
query searchCompany{
    //
}
```
Multiple queries
```
{
    com1: company(id: "12"){
        name
        users{
            firstName
        }
    }
    com2: company(id: "13"){
        name
        users{
            firstName
        }
    }
}
```
Query Fragments

```
{
    com1: company(id: "12"){
        ...companyInfo
        users{
            firstName
        }
    }
    com2: company(id: "13"){
        ...companyInfo
        users{
            firstName
        }
    }
}

fragment companyInfo on Company{
    id
    name
    desc
}
```

Mutations
```
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType, // return type
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, { firstName, age }) {
                return axios.post(`http://localhost:3000/users`, { firstName, age })
                    .then(res => res.data);
            }
        },
        deleteUser: {
            type: UserType, // return type
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve(parentValue, { id }) {
                return axios.delete(`http://localhost:3000/users/${id}`)
                    .then(res => res.data);
            }
        },
        editUser: {
            type: UserType, // return type
            args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, args) {
                return axios.patch(`http://localhost:3000/users/${args.id}`, args)
                    .then(res => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})
```
