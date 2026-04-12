import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <title>Dominion Arena Tática</title>
        <meta name="description" content="Dominion Arena Tática - Jogo de estratégia com cartas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700;800&display=swap" rel="stylesheet" />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
