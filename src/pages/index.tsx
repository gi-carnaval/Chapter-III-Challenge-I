import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
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
interface PostsProps {
  posts: Post[];
}
export default function Home({ posts, nextPage }): JSX.Element {
  const [postsArray, setPostsArray] = useState<Post[]>([]);
  const [hasNextPage, setHasNextPage] = useState(nextPage !== null);

  function loadMorePosts() {
    if (hasNextPage) {
      fetch(nextPage)
        .then(response => response.json())
        .then(function (data) {
          setHasNextPage(data.next_page !== null);
          const newPost = data.results.map(post => {
            return {
              slug: post.uid,
              title: post.data.title,
              author: post.data.author,
              subtitle: post.data.subtitle,
              createdAt: new Date(
                post.first_publication_date
              ).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
            };
          });
          setPostsArray(prev => [...prev, ...newPost]);
        });
    }
  }
  useEffect(() => {
    setPostsArray(posts);
  }, []);
  return (
    <main className={styles.container}>
      <div className={styles.posts}>
        {postsArray.map(post => {
          console.log(post);
          return (
            <div className={styles.post} key={post.slug}>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postSubtitle}>{post.subtitle}</p>
              <div className={styles.postInfo}>
                <span className={styles.createdAt}>
                  <FiCalendar className={styles.icon} />
                  {post.createdAt.replaceAll(/de /g, '').replace('.', '')}
                </span>
                <span className={styles.author}>
                  <FiUser className={styles.icon} />
                  {post.author}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {hasNextPage ? (
        <button type="button" onClick={loadMorePosts}>
          Click Here
        </button>
      ) : null}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    console.log(postsResponse);
    return {
      slug: post.uid,
      title: post.data.title,
      author: post.data.author,
      subtitle: post.data.subtitle,
      createdAt: new Date(post.first_publication_date).toLocaleDateString(
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
      posts,
      nextPage: postsResponse.next_page,
    },
  };
};
