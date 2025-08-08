import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Removed remote Google Fonts; rely on system fonts to keep runtime fully local */}
      </Head>
      <body style={{ 
        margin: 0, 
        padding: 0, 
        backgroundColor: 'transparent',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
