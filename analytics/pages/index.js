import Head from 'next/head';

export default function Home() {
  return (
    <div >
      <Head>
        <title>Analytics</title>
        <meta name="description" content="A website for viewing and managing my personal analytics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main >
        <h1 >
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p >
          Score: {}
          Get started by editing{' '}
          <code >pages/index.js</code>
        </p>

      </main>

      <footer >
        Footer
      </footer>
    </div>
  )
}
