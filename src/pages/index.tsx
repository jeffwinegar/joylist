import styles from './index.module.css';

export default function Home() {
  return (
    <main>
      <section className={styles['hero-section']}>
        <div className={styles['container']}>
          <article className={styles['hero-content']}>
            <h1>This is a heading that will be replaced soon</h1>
            <p>
              Some copy lorem ipsum dolor sit amet consectetur adipisicing elit.
              Obcaecati minima rem alias consequuntur quaerat ipsam libero quo!
              Vero, aliquid quae blanditiis laborum, animi natus, maxime ea
              deleniti voluptatem eius ratione.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
