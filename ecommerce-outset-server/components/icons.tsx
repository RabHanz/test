import React from 'react';

// If an icon is used as the sole content of a button, it needs a title or the button needs an aria-label.
// Example: <LogoIcon title="Ecommerce Outset Logo" />
// If used decoratively alongside text, use aria-hidden="true" on the SVG in the component using it.

export const LogoIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
    const { title, ...rest } = props;
    return (
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" {...rest}>
            {title && <title>{title}</title>}
            <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4"/>
            <path d="M30 70L50 30L70 70" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M40 70H60" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            <circle cx="50" cy="25" r="5" fill="currentColor"/>
        </svg>
    );
};

export const LaunchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a18.023 18.023 0 01-5.84 7.38m5.84-7.38L18 16.5m-3.41-2.13a6 6 0 015.84-7.38m0 0V4.5m0 4.5L18 16.5m-3.41-2.13a6 6 0 01-5.84-7.38m5.84 7.38L18 16.5m-1.5-9a5.983 5.983 0 00-3.41-1.01M12 4.5a5.983 5.983 0 00-3.41 1.01m0 0L6 10.5m0 0a5.983 5.983 0 003.41 1.01M9 16.5a5.983 5.983 0 003.41 1.01M15 19.5a5.983 5.983 0 003.41-1.01m0 0L21 14.5m0 0a5.983 5.983 0 00-3.41-1.01" />
  </svg>
);

export const ScaleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

export const MasterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

export const InvestIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21m-9 6h9M12 4.5Ab8.25 8.25 0 001.5 12.75a8.25 8.25 0 0010.5 0A8.25 8.25 0 0012 4.5z" />
  </svg>
);

export const ConnectIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-9-5.192A5.971 5.971 0 006 18.719M7.5 7.5h9M7.5 10.5h3M10.5 10.5c0 .675-.225 1.291-.626 1.786M10.5 10.5C11.175 10.5 12 10.03 12 9.375s-.825-1.125-1.5-1.125H7.5" />
  </svg>
);

export const MenuIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
};

export const CloseIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
};

export const SearchIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
};

export const GlobeIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
};

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
};

export const FacebookIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
};

export const TwitterIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path d="M22.46 6c-.77.35-1.6.58-2.46.67.9-.53 1.59-1.37 1.92-2.38-.84.5-1.78.86-2.79 1.07C18.28 4.44 17.03 4 15.64 4c-2.38 0-4.3 1.92-4.3 4.3 0 .33.04.66.11.97C7.9 8.97 4.74 7.29 2.55 4.6c-.3.52-.47 1.12-.47 1.76 0 1.49.76 2.81 1.91 3.58-.71 0-1.37-.22-1.95-.53v.05c0 2.08 1.48 3.82 3.44 4.21a4.3 4.3 0 01-1.12.15c-.28 0-.55-.03-.81-.08.55 1.7 2.13 2.94 4 2.97A8.62 8.62 0 011.95 18.3c-.27 0-.54-.02-.8-.05C3.28 19.44 5.36 20 7.62 20c5.86 0 9.07-4.86 9.07-9.07v-.41c.63-.45 1.17-.99 1.6-1.59z" />
    </svg>
  );
};

export const LinkedInIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14zm-11 6H5v10h3V9zm-1.5-2.25A1.75 1.75 0 004.75 5 1.75 1.75 0 006.5 6.75 1.75 1.75 0 008.25 5 1.75 1.75 0 006.5 3.25zm11.5 12.5H15V13.5c0-1.5-.54-2.5-1.85-2.5-.99 0-1.58.67-1.85 1.32-.1.23-.12.55-.12.88v5.55H8V9h3v1.35c.4-.63 1.1-1.52 2.7-1.52 2 0 3.3 1.32 3.3 4.18V19.5z" />
    </svg>
  );
};

export const InstagramIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.272.058 1.877.243 2.27.417.502.225.88.492 1.24.854.36.362.63.738.855 1.24.173.393.36 1 .416 2.27.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.057 1.272-.243 1.877-.416 2.27-.225.502-.492.88-.855 1.24-.36.362-.738.63-1.24.855-.393.173-1 .36-2.27.416-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.272-.058-1.877-.243-2.27-.416-.502-.225-.88-.492-1.24-.855-.36-.362-.63-.738-.854-1.24-.173-.393-.36-1-.417-2.27-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.058-1.272.243 1.877.417-2.27.225-.502.492.88.854-1.24.36-.362.738.63 1.24-.854.393-.173 1-.36 2.27-.417C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.115 0-3.486.011-4.71.068-1.15.053-1.62.231-1.92.382-.36.167-.62.381-.89.65-.27.27-.48.53-.65.89-.15.3-.33.77-.38 1.92-.06 1.225-.07 1.596-.07 4.71s.01 3.486.07 4.71c.05.15.23.62.38 1.92.17.36.38.62.65.89.27.27.53.48.89.65.3.15.77.33 1.92.38 1.225.06 1.596.07 4.71.07 3.115 0 3.486-.01 4.71-.07 1.15-.05 1.62-.23 1.92-.38.36-.17.62-.38.89-.65.27-.27.48-.53.65-.89.15-.3.33-.77.38-1.92.06-1.225.07-1.596-.07-4.71s-.01-3.486-.07-4.71c-.05-1.15-.23-1.62-.38-1.92-.17-.36-.38-.62-.65-.89-.27-.27-.53-.48-.89-.65-.3-.15-.77-.33-1.92-.38-1.225-.06-1.596-.07-4.71-.07zm0 2.914c-2.595 0-4.707 2.112-4.707 4.707s2.112 4.707 4.707 4.707 4.707-2.112 4.707-4.707S14.595 6.88 12 6.88zm0 7.612c-1.598 0-2.905-1.307-2.905-2.905s1.307-2.905 2.905-2.905 2.905 1.307 2.905 2.905-1.307 2.905-2.905 2.905zm4.838-8.016c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
    </svg>
  );
};

// Icons for Analytics Dashboard
export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372m-2.625-.372a9.331 9.331 0 00-2.475-3.112M15 19.128v-3.853m0 3.853a7.475 7.475 0 00-2.475-.372M15 19.128a9.336 9.336 0 002.625-.372M7.5 14.25S7.5 12 9 12s1.5 2.25 1.5 2.25m4.5-3H13.5m0 0V9m0 4.5v.007M18.75 10.5a4.502 4.502 0 00-9 0M12 4.5a4.502 4.502 0 019 0" />
  </svg>
);

export const TrendingUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

export const TrendingDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
  </svg>
);


export const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement> & { title?: string }) => {
  const { title, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role="img" {...rest}>
      {title && <title>{title}</title>}
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
};

export const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

export const BarChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
);

export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

export const ZapIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

export const FileTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

export const PlayCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
  </svg>
);

export const MessageSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.861 8.25-8.625 8.25S3.75 16.556 3.75 12D3.75 7.444 7.611 3.75 12.375 3.75S21 7.444 21 12z" />
  </svg>
);

// Icons for Launch Hub
export const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m4.5 9a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
export const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);
export const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);
export const WrenchScrewdriverIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.472-2.472a3.375 3.375 0 000-4.773L6.75 2.079a3.375 3.375 0 00-4.773 0L2.079 6.75a3.375 3.375 0 000 4.773l2.472 2.472M6.082 8.072L11.42 15.17M8.072 6.082L15.17 11.42" />
  </svg>
);
export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.25a4.5 4.5 0 01-3.09 3.09L12 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L5.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L12 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09z" />
  </svg>
);
export const DollarSignIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 11.219 12.768 11 12 11c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
export const UsersGroupIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-9-5.192A5.971 5.971 0 006 18.719M12 10.5a3 3 0 110-6 3 3 0 010 6zm-7 9a7 7 0 0114 0H5z" />
  </svg>
);


// Icons for Scale Hub
export const ActivityIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Business Health
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h4.5m12 0h-4.5m-4.5 0H12M3.75 12a7.5 7.5 0 0115 0m-15 0a7.5 7.5 0 0015 0M3.75 6.75h16.5M3.75 17.25h16.5" />
  </svg>
);
export const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Business Diagnostic / Invest
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.223V14.15M21 8.849a2.25 2.25 0 00-1.175-2.012l-7.5-4.25a2.25 2.25 0 00-2.15 0l-7.5 4.25A2.25 2.25 0 003 8.849v2.91c0 .621.504 1.125 1.125 1.125h13.75c.621 0 1.125-.504 1.125-1.125v-2.91z" />
  </svg>
);
export const CogIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Operational Excellence
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.036-7.026A7.5 7.5 0 0112 4.5v1.5m0 0a7.5 7.5 0 00-6.036 2.974m6.036-2.974A7.5 7.5 0 0112 19.5v-1.5m0 0a7.5 7.5 0 006.036-2.974M12 4.5a7.5 7.5 0 00-6.036 2.974M12 19.5v-1.5" />
  </svg>
);
export const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Infrastructure
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6.375a1.125 1.125 0 011.125 1.125V11.25a1.125 1.125 0 01-1.125 1.125H9A1.125 1.125 0 017.875 11.25V7.875A1.125 1.125 0 019 6.75z" />
  </svg>
);
export const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Mastermind / Insights
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.354a15.996 15.996 0 01-4.5 0m4.5 0V21m-4.5 0V18m0 0a6.062 6.062 0 003.75-5.632V6a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0118 6v6.368c0 2.287 1.115 4.369 2.912 5.632M12 18H9.75a2.25 2.25 0 01-2.25-2.25V6A2.25 2.25 0 019.75 3.75h4.5A2.25 2.25 0 0116.5 6v6.368c0 2.287-1.115 4.369-2.912 5.632M12 18v-5.25" />
  </svg>
);

// Icons for Master Hub
export const BrainIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Knowledge/Mastery
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
  </svg>
);
export const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Learning/Library
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);
export const NetworkIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Ecosystem/Connections
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);
export const PuzzlePieceIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Implementation Bridges/Problem-solving
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.75a6 6 0 016 6v6m-6-6a6 6 0 00-6 6v6m6-12V3.375A2.25 2.25 0 0012 1.125C11.083 1.125 10.22 1.51 9.577 2.1C8.935 1.51 8.073 1.125 7.125 1.125A2.25 2.25 0 004.875 3.375V6.75m0 0a6 6 0 006 6v6m-6-6H3.375A2.25 2.25 0 011.125 12C1.125 11.083 1.51 10.22 2.1 9.577c.592-.643.592-1.667 0-2.31C1.51 6.62 1.125 5.758 1.125 4.875A2.25 2.25 0 013.375 2.625H6.75m0 18v-6m0 6H9.75M12 21V3.375c0-.621.504-1.125 1.125-1.125C14.083 2.25 15 3.167 15 4.125v13.5A2.25 2.25 0 0017.25 19.5h.375c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

// Icons for Invest Hub
export const ChartPieIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Portfolio/Analytics
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 10.5V4.5m0 6c0 .806-.091 1.592-.26 2.338M10.5 10.5H4.5m6 0A5.942 5.942 0 0110.5 4.5m0 15a5.942 5.942 0 000-10.5m0 10.5a15.001 15.001 0 0010.26-4.662" />
  </svg>
);
export const CalculatorIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Financial Tools
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25v-.008zm.375-6.75h.008v.008H8.625v-.008zm0 2.25h.008v.008H8.625v-.008zm0 2.25h.008v.008H8.625v-.008zm0 2.25h.008v.008H8.625v-.008zm2.25-6.75h.008v.008H10.875v-.008zm0 2.25h.008v.008H10.875v-.008zm0 2.25h.008v.008H10.875v-.008zm0 2.25h.008v.008H10.875v-.008zm2.25-6.75h.008v.008H13.125v-.008zm0 2.25h.008v.008H13.125v-.008zm0 2.25h.008v.008H13.125v-.008zm0 2.25h.008v.008H13.125v-.008zm2.25-6.75h.008v.008H15.375v-.008zm0 2.25h.008v.008H15.375v-.008zm0 2.25h.008v.008H15.375v-.008zm0 2.25h.008v.008H15.375v-.008zM4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);
export const BanknotesIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For Investment/Finance
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0H21M3 12h18M3 15h18M3 9h18M3 6h18" />
  </svg>
);

// Icons for Connect Hub
export const HandshakeIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For connections, clients
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a2.25 2.25 0 11-4.5 0m4.5 0a2.25 2.25 0 10-4.5 0M3.75 6H7.5m3 12h9.75m-9.75 0a2.25 2.25 0 01-4.5 0m4.5 0a2.25 2.25 0 00-4.5 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.125 1.125 0 01-1.125-1.125V9.75c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V10.5m-3.75 0h3.75m-3.75 0a1.125 1.125 0 01-1.125-1.125V9.75c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125V10.5" />
  </svg>
);
export const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => ( // For showcase, marketing
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.343 1.11.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

// Example developer icon
export const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.122 5.014A5.953 5.953 0 006.75 6.75H6.375c-.414 0-.75.336-.75.75v1.313A5.953 5.953 0 009 11.938V18a.75.75 0 001.5 0v-6.062a5.953 5.953 0 002.25-3.125V7.5A.75.75 0 0012.375 6.75H12a5.953 5.953 0 00-2.878-1.736zM9 14.250c0-.118.006-.235.016-.351M9 14.25c-3.056 0-5.25-1.469-5.25-3.375 0-1.451 1.279-2.745 3.001-3.215C7.26 6.712 8.088 6 9 6c.913 0 1.74.712 2.25 1.66A3.733 3.733 0 0115 9.375c0 1.906-2.194 3.375-5.25 3.375H9z" />
    </svg>
);

export const ServerStackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}