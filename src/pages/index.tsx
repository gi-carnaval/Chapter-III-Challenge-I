import ptBR from 'date-fns/esm/locale/pt-BR/index.js';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { getPrismicClient } from '../services/prismic';
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
export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const formatedPosts = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });
  const [posts, setPosts] = useState<Post[]>(formatedPosts);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleNextPage = async (): Promise<void> => {
    const postResponse = await fetch(nextPage).then(response =>
      response.json()
    );
    setNextPage(postResponse.data.next_page);
    // setPosts(...posts, ...postResponse.data.)
  };
  return (
    <main className={styles.container}>
      <div className={styles.posts}>
        {posts?.map(post => (
          <Link key={post.uid} href={`/post/${post.uid}`}>
            <strong>{post.data.title}</strong>
            <p className={styles.postSubtitle}>{post.data.subtitle}</p>
            <div className={styles.postInfo}>
              <time className={styles.createdAt}>
                <FiCalendar className={styles.icon} />
                {post.first_publication_date
                  .replaceAll(/de /g, '')
                  .replace('.', '')}
              </time>
              <span className={styles.author}>
                <FiUser className={styles.icon} />
                {post.data.author}
              </span>
            </div>
          </Link>
        ))}
        {nextPage ? (
          <button
            type="button"
            className={styles.buttonLoadMore}
            onClick={handleNextPage}
          >
            Carregar mais posts
          </button>
        ) : null}
      </div>
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts');

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
    revalidate: 1800,
  };
};
