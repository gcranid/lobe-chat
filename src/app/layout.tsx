import { PropsWithChildren } from 'react';
import { Analytics } from '@vercel/analytics/next';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Next.js</title>
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

export default Layout;
