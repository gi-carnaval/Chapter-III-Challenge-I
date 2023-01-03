import styles from './header.module.scss';

export function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/Logo.png" alt="logo" />
      </div>
    </header>
  );
}
