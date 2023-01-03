import { GetStaticProps } from 'next';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsResponse, posts }): JSX.Element {
  console.log(postsResponse.results);

  return (
    <>
      {posts.map(post => {
        return (
          <div key={post.slug}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <span className={styles.dateText}>
              {post.publicationDate.replaceAll(/de /g, '').replace('.', '')}
            </span>
          </div>
        );
      })}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      author: post.data.author,
      content: post.data.content[0].heading,
      publicationDate: new Date(post.first_publication_date).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      ),
    };
  });
  return {
    props: {
      postsResponse,
      posts,
    },
  };
};
