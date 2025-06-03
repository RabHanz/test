declare module '@mailchimp/mailchimp_marketing' {
  interface MailchimpMarketing {
    setConfig: (config: { apiKey: string; server: string }) => void;
    lists: {
      getList: (listId: string) => Promise<any>;
      addListMember: (listId: string, data: any) => Promise<any>;
    };
  }
  class Mailchimp implements MailchimpMarketing {
    constructor(apiKey: string);
    setConfig(config: { apiKey: string; server: string }): void;
    lists: {
      getList(listId: string): Promise<any>;
      addListMember(listId: string, data: any): Promise<any>;
    };
  }
  export default Mailchimp;
}

declare module 'stripe' {
  interface Stripe {
    customers: {
      create: (data: any) => Promise<any>;
      list: (params: any) => Promise<any>;
    };
    charges: {
      create: (data: any) => Promise<any>;
      list: (params: any) => Promise<any>;
    };
  }
  class Stripe {
    constructor(secretKey: string, options?: any);
    customers: {
      create(data: any): Promise<any>;
      list(params: any): Promise<any>;
    };
    charges: {
      create(data: any): Promise<any>;
      list(params: any): Promise<any>;
    };
  }
  export default Stripe;
} 