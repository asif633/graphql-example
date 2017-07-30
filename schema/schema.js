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