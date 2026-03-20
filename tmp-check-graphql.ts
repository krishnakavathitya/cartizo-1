import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client';
import fetch from 'cross-fetch';

const client = new ApolloClient({
    link: new HttpLink({ uri: 'http://localhost:3000/api/graphql', fetch }),
    cache: new InMemoryCache(),
});

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`;

async function test() {
    try {
        const { data } = await client.query({ query: GET_CATEGORIES });
        console.log('Categories from API:');
        console.log(JSON.stringify(data.categories, null, 2));
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

test();
