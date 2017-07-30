## GraphQL with Nodejs ##

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

