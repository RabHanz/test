declare module '@mailchimp/mailchimp_marketing' {
  const mailchimp: {
    setConfig: (config: { apiKey: string; server: string }) => void;
    lists: {
      addListMember: (listId: string, data: { email_address: string; status: string }) => Promise<any>;
    };
  };
  export default mailchimp;
}

declare module 'zoomapi' {
  const Zoom: any;
  export default Zoom;
}

declare module '@clickup/api' {
  const ClickUp: any;
  export default ClickUp;
} 