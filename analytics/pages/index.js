import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Home() {
    const [productivity, setProductivity] = useState(0);

    useEffect(() => {
        fetch('/api/hello/').then(res => {
            return res.json();
        }).then(res => {

            console.log(res);
            setProductivity(res);
        });
    });


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
                    Score: { productivity }
                </p>

            </main>

            <footer >
                Footer
            </footer>
        </div>
    )
}
